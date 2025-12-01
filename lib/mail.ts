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


export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Sossilver" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Password Akun Sossilver',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
              <h1 style="color: #333; text-align: center;">Reset Password</h1>
              <p>Halo,</p>
              <p>Kami menerima permintaan untuk mereset password akun Sossilver Anda.</p>
              <p>Klik tombol di bawah ini untuk membuat password baru:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #dc2626; color: white; padding: 12px 32px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Atau salin link ini: <a href="${resetLink}" style="color: #3b82f6;">${resetLink}</a></p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Jika Anda tidak meminta reset password, abaikan email ini. Link ini akan kedaluwarsa dalam 1 jam.
              </p>
            </div>
          </body>
        </html>
      `
    })

    console.log('✅ Email reset password terkirim:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('❌ Error mengirim email reset:', error)
    return { success: false, error: 'Gagal mengirim email.' }
  }
}
