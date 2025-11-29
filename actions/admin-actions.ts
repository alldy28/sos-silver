/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Tipe Data untuk Tabel Customer
export type CustomerData = {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: Role
  isAffiliate: boolean
  affiliateCode: string | null
  joinedAt: Date
  // Data Agregasi Affiliate
  totalCommission: number
  totalSalesGramasi: number
  totalSalesCount: number
}

/**
 * Mengambil daftar semua customer beserta statistik affiliate mereka.
 */
export async function getCustomersListAction (
  query: string = ''
): Promise<CustomerData[]> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return []
  }

  try {
    // 1. Ambil semua user dengan role CUSTOMER
    const customers = await db.user.findMany({
      where: {
        role: Role.CUSTOMER,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { affiliateCode: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        // Ambil data komisi yang sudah dicatat
        commissions: {
          select: { amount: true }
        },
        // Ambil data invoice yang direferensikan oleh user ini (sebagai affiliate)
        referredInvoices: {
          where: { status: 'SELESAI' }, // Hanya hitung yang sudah SELESAI/PAID
          include: {
            items: { select: { gramasi: true, quantity: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Format data & Hitung Agregasi
    const formattedData: CustomerData[] = customers.map(user => {
      // Hitung Total Komisi dari tabel AffiliateCommission
      const totalCommission = user.commissions.reduce(
        (sum, c) => sum + c.amount,
        0
      )

      // Hitung Total Gramasi & Jumlah Transaksi dari referredInvoices
      let totalSalesGramasi = 0
      const totalSalesCount = user.referredInvoices.length

      user.referredInvoices.forEach(inv => {
        inv.items.forEach(item => {
          totalSalesGramasi += item.gramasi * item.quantity
        })
      })

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: null, // Anda bisa tambahkan field phone di model User jika perlu
        role: user.role,
        isAffiliate: user.isAffiliate,
        affiliateCode: user.affiliateCode,
        joinedAt: user.createdAt,
        totalCommission,
        totalSalesGramasi,
        totalSalesCount
      }
    })

    return formattedData
  } catch (error) {
    console.error('Gagal mengambil data customer:', error)
    return []
  }
}

/**
 * Mengubah Status Affiliate (Aktifkan/Nonaktifkan)
 */
export async function toggleAffiliateStatusAction (
  userId: string,
  isActive: boolean
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return { error: 'Unauthorized' }
  }

  try {
    // Jika mengaktifkan, kita perlu pastikan dia punya kode unik jika belum ada
    const updateData: any = { isAffiliate: isActive }

    if (isActive) {
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user?.affiliateCode) {
        // Generate kode jika belum ada
        const cleanName =
          user?.name
            ?.split(' ')[0]
            .replace(/[^a-zA-Z]/g, '')
            .toUpperCase() || 'USER'
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        updateData.affiliateCode = `${cleanName}${randomNum}`
      }
    }

    await db.user.update({
      where: { id: userId },
      data: updateData
    })

    revalidatePath('/dashboard/customers')
    return {
      success: true,
      message: `Status affiliate berhasil ${
        isActive ? 'diaktifkan' : 'dinonaktifkan'
      }.`
    }
  } catch (error) {
    console.error('Gagal update status affiliate:', error)
    return { error: 'Gagal mengubah status.' }
  }
}
