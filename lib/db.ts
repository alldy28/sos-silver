// lib/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // izinkan 'prisma' di global 'NodeJS'
  var prisma: PrismaClient | undefined
}

// Mencegah koneksi baru dibuat setiap kali ada hot-reload
export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}
