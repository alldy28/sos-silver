'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth'; // Impor auth untuk mendapatkan ID admin
import { revalidatePath } from 'next/cache';

// Tipe data untuk item di keranjang (dari sisi klien)
export interface CartItemInput {
  productId: string;
  quantity: number;
  priceAtTime: number; // Harga satuan produk
}

// Tipe data untuk info pelanggan
export interface CustomerInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

/**
 * Aksi untuk mencari produk berdasarkan nama
 */
export async function searchProductsAction(query: string) {
  if (!query) {
    return [];
  }
  try {
    const products = await db.sossilverProduct.findMany({
      where: {
        nama: {
          contains: query,
          mode: 'insensitive', // Tidak case-sensitive
        },
      },
      take: 10, // Batasi 10 hasil
    });
    return products;
  } catch (error) {
    console.error('Gagal mencari produk:', error);
    return [];
  }
}

/**
 * Aksi untuk membuat Invoice baru
 */
export async function createInvoiceAction(
  customer: CustomerInput,
  items: CartItemInput[],
  shippingFee: number,
  totalAmount: number
) {
  const session = await auth(); // Dapatkan sesi admin yang login
  if (!session?.user?.id) {
    return { success: false, message: 'Admin tidak terautentikasi.' };
  }
  const adminId = session.user.id;

  if (items.length === 0) {
    return { success: false, message: 'Keranjang tidak boleh kosong.' };
  }
  if (!customer.customerName) {
    return { success: false, message: 'Nama pelanggan wajib diisi.' };
  }

  try {
    // Buat nomor invoice unik (Contoh: INV-20251031-A1B2)
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${datePart}-${randomPart}`;

    // Gunakan transaksi Prisma untuk memastikan semua data tersimpan
    const newInvoice = await db.$transaction(async (prisma) => {
      // 1. Buat data Invoice utama
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerName: customer.customerName,
          customerPhone: customer.customerPhone || null,
          customerAddress: customer.customerAddress || null,
          shippingFee,
          totalAmount,
          status: 'UNPAID', // Default status
          createdById: adminId,
        },
      });

      // 2. Buat semua InvoiceItem
      await prisma.invoiceItem.createMany({
        data: items.map((item) => ({
          invoiceId: invoice.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
        })),
      });

      return invoice;
    });

    revalidatePath('/dashboard/kasir');
    revalidatePath('/dashboard/invoices'); // Nanti untuk halaman daftar invoice

    return {
      success: true,
      message: `Invoice ${newInvoice.invoiceNumber} berhasil dibuat.`,
      invoiceId: newInvoice.id,
    };
  } catch (error) {
    console.error('Gagal membuat invoice:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan server saat membuat invoice.',
    };
  }
}
