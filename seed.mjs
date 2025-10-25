// seed.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const db = new PrismaClient()

async function main () {
  const email = 'aldimaulana19@gmail.com' // GANTI DENGAN EMAIL ANDA
  const password = 'Rahasia@2025' // GANTI DENGAN PASSWORD ANDA

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Buat user
  const user = await db.user.create({
    data: {
      email: email,
      password: hashedPassword
    }
  })

  console.log(`Berhasil membuat user admin: ${user.email}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
