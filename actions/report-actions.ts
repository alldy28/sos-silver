'use server'

import { db } from '@/lib/db'

export type ReportData = {
  id: string
  invoiceNumber: string
  date: Date
  customerName: string
  totalAmount: number
  status: string
}

export type ReportSummary = {
  totalTransaction: number
  totalRevenue: number
  data: ReportData[]
}

/**
 * Mengambil data laporan berdasarkan rentang tanggal
 * @param startDateStr Tanggal Mulai (YYYY-MM-DD)
 * @param endDateStr Tanggal Akhir (YYYY-MM-DD)
 */
export async function getReportDataAction (
  startDateStr: string,
  endDateStr: string
): Promise<ReportSummary> {
  if (!startDateStr || !endDateStr) {
    return { totalTransaction: 0, totalRevenue: 0, data: [] }
  }

  // Konversi string ke Date object
  const start = new Date(startDateStr)
  // Set jam ke awal hari (00:00:00)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDateStr)
  // Set jam ke akhir hari (23:59:59)
  end.setHours(23, 59, 59, 999)

  try {
    const invoices = await db.invoice.findMany({
      where: {
        createdAt: {
          gte: start, // Lebih besar atau sama dengan Start Date
          lte: end // Lebih kecil atau sama dengan End Date
        },
        // Filter status yang dianggap valid untuk laporan
        status: {
          in: ['PAID', 'SELESAI', 'SEDANG_DISIAPKAN', 'SEDANG_PENGIRIMAN']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        invoiceNumber: true,
        createdAt: true,
        customerName: true,
        totalAmount: true,
        status: true
      }
    })

    const data = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.createdAt,
      customerName: inv.customerName,
      totalAmount: inv.totalAmount,
      status: inv.status
    }))

    const totalRevenue = data.reduce((acc, curr) => acc + curr.totalAmount, 0)

    return {
      totalTransaction: data.length,
      totalRevenue,
      data
    }
  } catch (error) {
    console.error('Gagal mengambil laporan:', error)
    return { totalTransaction: 0, totalRevenue: 0, data: [] }
  }
}
