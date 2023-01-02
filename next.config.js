const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      // https://github.com/vercel/next.js/issues/7755#issuecomment-937721514
      config.resolve.fallback.fs = false
    }
    config.resolve.mainFields = ['browser', 'main', 'module']

    // ffmpeg
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.NormalModuleReplacementPlugin(/node:/, resource => {
        const mod = resource.request.replace(/^node:/, '')
        switch (mod) {
          case 'buffer':
            resource.request = 'buffer'
            break
          case 'stream':
            resource.request = 'readable-stream'
            break
          default:
            throw new Error(`Not found ${mod}`)
        }
      })
    )
    return config
  },
  async headers() {
    return [
      {
        source: '/editor', // change to appropriate path
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
