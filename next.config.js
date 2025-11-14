/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== IMAGE OPTIMIZATION =====
  images: {
    remotePatterns: [
      // External CDN & Services
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
      // Local domain
      {
        protocol: 'https',
        hostname: 'sossilver.co.id',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**'
      },
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**'
      }
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // ===== SERVER ACTIONS =====
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:4002',
        '*.devtunnels.ms',
        '4gw2rzz0-3000.asse.devtunnels.ms',
        '103.6.55.38',
        'sossilver.co.id',
        'www.sossilver.co.id'
      ],
      bodySizeLimit: '5mb' // For file uploads
    }
  },

  // ===== STATIC FILE SERVING =====
  publicRuntimeConfig: {
    staticFolder: '/public'
  },

  // ===== HEADERS =====
  async headers () {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  },

  // ===== REWRITES (Optional - untuk serve local files) =====
  async rewrites () {
    return {
      beforeFiles: [
        // This allows /uploads/* to be served from public/uploads
        {
          source: '/uploads/:path*',
          destination: '/uploads/:path*'
        }
      ]
    }
  },

  // ===== SECURITY HEADERS =====
  async redirects () {
    return [
      // Redirect HTTP to HTTPS (if needed)
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://:host/:path*',
        permanent: false
      }
    ]
  },

  // ===== BUILD OPTIMIZATION =====
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,

  // ===== ENVIRONMENT VARIABLES =====
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || 'https://sossilver.co.id'
  },

  // ===== WEBPACK CONFIG =====
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side only
      config.externals.push('sharp')
    }
    return config
  },

  // ===== LOGGING =====
  logging: {
    fetches: {
      fullUrl: true
    }
  },

  // ===== TYPESCRIPT =====
  typescript: {
    // Disable type checking during build if needed
    // tsconfigPath: './tsconfig.json'
  }
}

module.exports = nextConfig
