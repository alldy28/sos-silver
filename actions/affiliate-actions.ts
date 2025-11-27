'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// 1. Aktivasi Akun Affiliate
export async function activateAffiliateAction () {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Harap login terlebih dahulu.' }

  // Generate kode unik sederhana (Nama depan + 4 angka random)
  // Contoh: ALDI4829
  const userName =
    session.user.name
      ?.split(' ')[0]
      .toUpperCase()
      .replace(/[^A-Z]/g, '') || 'USER'
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const code = `${userName}${randomNum}`

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        isAffiliate: true,
        affiliateCode: code
      }
    })
    revalidatePath('/affiliate')
    return { success: true }
  } catch (error) {
    console.error('Gagal aktivasi affiliate:', error)
    return { error: 'Gagal mengaktifkan affiliate. Silakan coba lagi.' }
  }
}

// 2. Ambil Data Dashboard Affiliate
export async function getAffiliateData () {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      commissions: {
        include: {
          invoice: {
            select: { customerName: true, invoiceNumber: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) return null

  // Jika belum jadi affiliate, kembalikan null tapi tandai user ada
  if (!user.isAffiliate) return { isAffiliate: false }

  // Hitung total komisi
  const totalCommission = user.commissions.reduce(
    (acc, curr) => acc + curr.amount,
    0
  )

  return {
    isAffiliate: true,
    code: user.affiliateCode,
    totalCommission,
    history: user.commissions
  }
}

// 3. Cek Nama Affiliate dari Kode (Untuk di Cart)
export async function getAffiliateNameByCode (code: string) {
  try {
    const user = await db.user.findUnique({
      where: { affiliateCode: code },
      select: { name: true, id: true }
    })
    return user
  } catch (error) {
    return null
  }
}
