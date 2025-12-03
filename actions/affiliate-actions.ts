'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
// import { put } from '@vercel/blob'
import { Role } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'


// Tipe return untuk Activate Action
export type AffiliateActionState = {
  success?: boolean
  error?: string
}

// [FIX] New type for Payout Action state
export type PayoutActionState = {
  success?: boolean
  error?: string
  message?: string
}

/**
 * 1. Aktivasi Akun Affiliate
 */
export async function activateAffiliateAction (): Promise<AffiliateActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Harap login terlebih dahulu.' }
  }

  const userId = session.user.id

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { isAffiliate: true }
  })

  if (existingUser?.isAffiliate) {
    return { error: 'Anda sudah menjadi affiliate.' }
  }

  const cleanName =
    session.user.name
      ?.split(' ')[0]
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase() || 'USER'
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  let code = `${cleanName}${randomNum}`

  let isCodeUnique = false
  let attempts = 0

  while (!isCodeUnique && attempts < 5) {
    const existingCode = await db.user.findUnique({
      where: { affiliateCode: code }
    })
    if (!existingCode) {
      isCodeUnique = true
    } else {
      const newRandom = Math.floor(1000 + Math.random() * 9000)
      code = `${cleanName}${newRandom}`
      attempts++
    }
  }

  if (!isCodeUnique) {
    return { error: 'Gagal membuat kode unik. Silakan coba lagi.' }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        isAffiliate: true,
        affiliateCode: code
      }
    })

    revalidatePath('/myaccount/affiliate')
    return { success: true }
  } catch (error) {
    console.error('Gagal aktivasi affiliate:', error)
    return { error: 'Gagal mengaktifkan affiliate. Silakan coba lagi nanti.' }
  }
}

/**
 * 2. Ambil Data Dashboard Affiliate
 */
export async function getAffiliateData () {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      // Riwayat Komisi
      commissions: {
        include: {
          invoice: {
            select: { customerName: true, invoiceNumber: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      // Riwayat Pencairan
      payouts: {
        orderBy: { createdAt: 'desc' }
      },
      // [BARU] Daftar Pelanggan Referral
      referredInvoices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          customerPhone: true, // Untuk tombol WA
          status: true,
          totalAmount: true,
          createdAt: true
        }
      }
    }
  })

  if (!user) return null

  // Jika belum jadi affiliate, kembalikan objek kosong yang aman
  if (!user.isAffiliate) {
    return {
      isAffiliate: false,
      code: null,
      totalCommission: 0,
      availableBalance: 0,
      pendingPayout: 0,
      paidPayout: 0,
      history: [],
      payouts: [],
      referrals: []
    }
  }

  // --- PERHITUNGAN SALDO ---

  // Total semua komisi yang pernah didapat
  const totalCommission = user.commissions.reduce(
    (acc, curr) => acc + curr.amount,
    0
  )

  // Total uang yang sedang diajukan pencairannya (PENDING)
  const pendingPayout = user.payouts
    .filter(p => p.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Total uang yang SUDAH dicairkan (PROCESSED)
  const paidPayout = user.payouts
    .filter(p => p.status === 'PROCESSED')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Saldo yang BISA ditarik saat ini
  const availableBalance = totalCommission - paidPayout - pendingPayout

  return {
    isAffiliate: true,
    code: user.affiliateCode,
    totalCommission,
    availableBalance,
    pendingPayout,
    paidPayout,
    history: user.commissions,
    payouts: user.payouts,
    referrals: user.referredInvoices // Data referral
  }
}


const PayoutSchema = z.object({
  bankName: z.string().min(1, 'Nama Bank wajib diisi'),
  accountNumber: z.string().min(1, 'Nomor Rekening wajib diisi'),
  accountName: z.string().min(1, 'Nama Pemilik Rekening wajib diisi'),
  amount: z.number().min(10000, 'Minimal penarikan Rp 10.000')
})

// Action Request Payout
// [FIX] Typed prevState properly
export async function requestPayoutAction (
  prevState: PayoutActionState | undefined,
  formData: FormData
): Promise<PayoutActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Login diperlukan' }

  const rawData = {
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    accountName: formData.get('accountName'),
    amount: Number(formData.get('amount'))
  }

  const validated = PayoutSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { bankName, accountNumber, accountName, amount } = validated.data

  const affiliateData = await getAffiliateData()
  if (!affiliateData || affiliateData.availableBalance < amount) {
    return { error: 'Saldo tidak mencukupi.' }
  }

  try {
    await db.payoutRequest.create({
      data: {
        amount,
        bankName,
        accountNumber,
        accountName,
        status: 'PENDING',
        affiliateId: session.user.id
      }
    })

    revalidatePath('/myaccount/affiliate')
    return { success: true, message: 'Permintaan pencairan berhasil dikirim!' }
  } catch (error) {
    console.error('Request Payout Error:', error)
    return { error: 'Gagal memproses permintaan.' }
  }
}

/**
 * 3. Cek Nama Affiliate dari Kode
 */
export async function getAffiliateNameByCode (code: string) {
  if (!code) return null
  try {
    const user = await db.user.findUnique({
      where: { affiliateCode: code },
      select: { name: true, id: true }
    })
    return user
  } catch (error) {
    console.error('Error fetching affiliate name:', error)
    return null
  }
}

/**
 * [BARU] Admin Memproses Payout (Upload Bukti TF)
 */
// [FIX] Replaced 'any' with PayoutActionState | undefined
export async function processPayoutAction (
  prevState: PayoutActionState | undefined,
  formData: FormData
): Promise<PayoutActionState> {
  // 1. Cek Hak Akses Admin
  const session = await auth()
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return { error: 'Akses ditolak. Hanya Admin.' }
  }

  const requestId = formData.get('id') as string
  const file = formData.get('file') as File

  if (!requestId) return { error: 'ID Request tidak ditemukan.' }

  // Validasi File
  if (!file || file.size === 0) return { error: 'Bukti transfer wajib diisi.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Ukuran file maksimal 5MB.' }

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
  if (!validTypes.includes(file.type)) {
    return { error: 'Format file harus gambar (JPG/PNG/WEBP) atau PDF.' }
  }

  try {
    // 2. Persiapan Folder Penyimpanan Lokal
    // Kita simpan di folder "public/uploads/payouts" agar bisa diakses via URL
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payouts')

    // Buat folder jika belum ada
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // 3. Proses File Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Buat nama file unik
    const ext = file.name.split('.').pop()
    const filename = `proof-${requestId}-${Date.now()}.${ext}`

    // Path lengkap di server
    const filePath = path.join(uploadDir, filename)

    // 4. Tulis file ke disk
    await fs.writeFile(filePath, buffer)

    // 5. URL Publik untuk Database
    // Karena disimpan di folder public, URL-nya adalah path relatif
    const fileUrl = `/api/uploads/uploads/payouts/${filename}`

    // 6. Update Database
    await db.payoutRequest.update({
      where: { id: requestId },
      data: {
        status: 'PROCESSED',
        proofUrl: fileUrl
      }
    })

    revalidatePath('/dashboard/payouts')
    return {
      success: true,
      message: 'Payout berhasil diproses dan bukti tersimpan di server lokal.'
    }
  } catch (error) {
    console.error('Error processing payout:', error)
    return { error: 'Gagal menyimpan file ke server.' }
  }
}


/**
 * [BARU] Admin Reject Payout
 */
export async function rejectPayoutAction (requestId: string) {
  const session = await auth()
  if (session?.user.role !== Role.ADMIN) return { error: 'Unauthorized' }

  try {
    await db.payoutRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    })
    revalidatePath('/dashboard/payouts')
    return { success: true, message: 'Permintaan ditolak.' }
  } catch (error) {
    return { error: 'Gagal menolak permintaan.' }
  }
}
