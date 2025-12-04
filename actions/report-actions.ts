'use server'

import { db } from '@/lib/db'

export type ReportData = {
  id: string
  invoiceNumber: string
  date: Date
  customerName: string
  totalAmount: number
  status: string
  products: string
}

export type ReportSummary = {
  totalTransaction: number
  totalRevenue: number
  data: ReportData[]
}

/**
 * Mengambil data laporan berdasarkan rentang tanggal
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
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDateStr)
  end.setHours(23, 59, 59, 999)

  try {
    const invoices = await db.invoice.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        // Filter status: Hanya ambil yang sudah dibayar/selesai/proses
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
        status: true,
        // Ambil data items
        items: {
          select: {
            quantity: true,
            gramasi: true,
            // [FIX] Hapus 'variant', hanya ambil quantity dan relasi product
            product: {
              select: {
                nama: true // [FIX] Menggunakan 'nama' sesuai schema SossilverProduct
              }
            }
          }
        }
      }
    })

    // Mapping data agar formatnya sesuai untuk Frontend
    const data: ReportData[] = invoices.map(inv => {
      // Gabungkan nama produk menjadi string: "Cincin Emas x1, Kalung Perak x2"
      const productString = inv.items
        .map(item => {
          const productName = item.product?.nama || 'Produk Dihapus'
          const gramasiInfo = item.gramasi > 0 ? ` (${item.gramasi}gr)` : '';
          return `${productName}${gramasiInfo} x${item.quantity}`
        })
        .join(', ')

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.createdAt,
        customerName: inv.customerName,
        totalAmount: inv.totalAmount,
        status: inv.status,
        products: productString || '-' // Masukkan ke kolom products
      }
    })

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
