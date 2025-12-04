/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import fs from 'node:fs/promises'
import path from 'node:path'

// --- ACTION 1: GENERATE TAGIHAN PABRIK (CUT-OFF SYSTEM) ---
export async function createFactoryPaymentBatch (cutOffDateTimeStr: string) {
  if (!cutOffDateTimeStr)
    return { success: false, message: 'Waktu cut-off wajib diisi' }

  // Menerima format lengkap "YYYY-MM-DDTHH:mm" dari frontend
  const cutOffDate = new Date(cutOffDateTimeStr)

  try {
    // 1. CARI INVOICE YANG VALID
    // Syarat:
    // a. Tanggal buat <= Cut-off (Spesifik sampai jam-nya)
    // b. Belum masuk tagihan manapun (factoryPaymentId: null)
    // c. Status bukan CANCELLED dan bukan UNPAID/WAITING (Harus sudah diproses)
    const pendingInvoices = await db.invoice.findMany({
      where: {
        createdAt: { lte: cutOffDate },
        factoryPaymentId: null,
        status: {
          in: ['SEDANG_DISIAPKAN', 'SEDANG_PENGIRIMAN', 'SELESAI']
        }
      },
      include: {
        items: true // Ambil items untuk hitung gramasi
      }
    })

    if (pendingInvoices.length === 0) {
      return {
        success: false,
        message: 'Tidak ada invoice SIAP PRODUKSI hingga waktu tersebut.'
      }
    }

    // 2. HITUNG TOTAL GRAMASI
    let totalBatchGramasi = 0

    pendingInvoices.forEach(inv => {
      inv.items.forEach(item => {
        // Pastikan gramasi ada nilainya, jika null anggap 0
        totalBatchGramasi += item.gramasi || 0
      })
    })

    // 3. SIMPAN KE DATABASE
    await db.factoryPayment.create({
      data: {
        code: `FP-${Date.now()}`, // Generate kode unik
        periodEnd: cutOffDate, // Simpan tanggal DAN jam nya
        totalGramasi: totalBatchGramasi, // Simpan sebagai Berat (Float)
        status: 'UNPAID',
        invoices: {
          connect: pendingInvoices.map(inv => ({ id: inv.id }))
        }
      }
    })

    revalidatePath('/dashboard/factory')
    return {
      success: true,
      message: `Sukses! ${pendingInvoices.length} invoice masuk batch. Total: ${totalBatchGramasi} Gram`
    }
  } catch (error) {
    console.error('Create Batch Error:', error)
    return { success: false, message: 'Gagal membuat tagihan pabrik.' }
  }
}


// --- ACTION 2: UPLOAD BUKTI & TANDAI LUNAS ---

// Schema Validasi File
const UploadSchema = z.object({
  id: z.string(),
  file: z
    .instanceof(File, { message: 'File wajib diisi' })
    .refine(f => f.size < 5 * 1024 * 1024, 'Maksimal ukuran file 5MB')
    .refine(f => f.type.startsWith('image/'), 'Harus berupa gambar')
})

export async function uploadFactoryProofAction (
  prevState: any,
  formData: FormData
) {
  const validatedFields = UploadSchema.safeParse({
    id: formData.get('id'),
    file: formData.get('file')
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'File tidak valid (Max 5MB, format Gambar)',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, file } = validatedFields.data

  try {
    // 1. Simpan File ke Folder public/uploads/tagihan-produksi
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `factory-${Date.now()}-${file.name.replace(/\s+/g, '-')}`

    // [UBAH BAGIAN INI] Tambahkan 'tagihan-produksi' ke dalam path
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'tagihan-produksi'
    )

    // Pastikan folder ada (Code ini akan otomatis membuat folder jika belum ada)
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Tulis file ke folder tersebut
    await fs.writeFile(path.join(uploadDir, filename), buffer)

    // [UBAH BAGIAN INI JUGA] Sesuaikan URL agar bisa diakses browser
    const fileUrl = `/uploads/tagihan-produksi/${filename}`

    // 2. Update Database
    await db.factoryPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        proofUrl: fileUrl
      }
    })

    revalidatePath('/dashboard/factory')
    return {
      status: 'success',
      message: 'Bukti berhasil diupload ke folder tagihan-produksi!'
    }
  } catch (error) {
    console.error('Upload Error:', error)
    return { status: 'error', message: 'Terjadi kesalahan saat upload.' }
  }
}




