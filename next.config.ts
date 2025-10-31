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
      },
      {
        protocol: 'https',
        hostname: 'minigoldindonesia.sdgm.co.id',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'sossilver.co.id',
        port: '',
        pathname: '/**'
      },
      // Anda mungkin perlu menambahkan domain lain di sini
      // jika 'product.gambarUrl' Anda berasal dari domain eksternal lain
    ]
  },
  experimental: {
  serverActions: {
    allowedOrigins: [
      'localhost:3000',
      '*.devtunnels.ms', // Izinkan semua devtunnels
      '4gw2rzz0-3000.asse.devtunnels.ms',
      '103.6.55.38',
      'sossilver.co.id', // Atau spesifik tunnel Anda
    ]
  }
}
}

module.exports = nextConfig
