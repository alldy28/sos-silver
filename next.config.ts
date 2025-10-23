// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TAMBAHKAN BAGIAN INI
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'www.minigold.co.id',
        port: '',
        pathname: '/**'
      }
      // Anda mungkin perlu menambahkan domain lain di sini
      // jika 'product.gambarUrl' Anda berasal dari domain eksternal lain
    ]
  }
}

module.exports = nextConfig
