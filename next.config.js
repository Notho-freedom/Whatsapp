/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Temporairement commenté pour résoudre l'erreur
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@/components': require('path').resolve(__dirname, 'src/components'),
      '@/auth': require('path').resolve(__dirname, 'src/components/auth'),
      '@/layout': require('path').resolve(__dirname, 'src/components/layout'),
      '@/common': require('path').resolve(__dirname, 'src/components/common'),
      '@/ui': require('path').resolve(__dirname, 'src/components/ui'),
      '@/chat': require('path').resolve(__dirname, 'src/components/chat'),
      '@/status': require('path').resolve(__dirname, 'src/components/status'),
      '@/calls': require('path').resolve(__dirname, 'src/components/calls'),
      '@/features': require('path').resolve(__dirname, 'src/features'),
      '@/hooks': require('path').resolve(__dirname, 'src/hooks'),
      '@/utils': require('path').resolve(__dirname, 'src/utils'),
      '@/context': require('path').resolve(__dirname, 'src/context'),
      '@/types': require('path').resolve(__dirname, 'src/types'),
      '@/constants': require('path').resolve(__dirname, 'src/constants'),
      '@/styles': require('path').resolve(__dirname, 'src/styles'),
      '@/app': require('path').resolve(__dirname, 'src/app')
    };
    return config;
  }
}

module.exports = nextConfig
