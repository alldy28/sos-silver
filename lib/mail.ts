'use server'

import nodemailer from 'nodemailer'

// [PERBAIKAN] Menggunakan kode Nodemailer baru Anda
const domain = process.env.NEXTAUTH_URL || 'https://sossilver.co.id'

// Konfigurasi Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Email Gmail Anda
    pass: process.env.GMAIL_APP_PASSWORD //app password
  }
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmationLink = `${domain}/auth/new-verification?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Sossilver" <${process.env.GMAIL_USER}>`, // [PERBAIKAN] Gunakan email Anda di sini
      to: email,
      subject: 'Aktivasi Akun Sossilver Anda',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
              <h1 style="color: #333; text-align: center;">Aktivasi Akun Sossilver</h1>
              <p>Halo,</p>
              <p>Terima kasih telah mendaftar di Sossilver!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationLink}" 
                   style="background-color: #1a237e; color: white; padding: 12px 32px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                  Aktivasi Akun
                </a>
              </div>
              <p>Atau salin dan tempel link ini di browser Anda:</p>
              <p style="word-break: break-all; color: #3b82f6;">${confirmationLink}</p>
            </div>
          </body>
        </html>
      `
    })

    console.log('✅ Email terkirim:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('❌ Error mengirim email:', error)
    return { success: false, error: 'Gagal mengirim email.' }
  }
}
