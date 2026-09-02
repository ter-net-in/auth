import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Compile the workspace TS packages (they ship raw .ts, NodeNext-style).
  transpilePackages: ['@ternetin/auth', '@ternetin/db', '@ternetin/config'],
  webpack: (config) => {
    // Resolve NodeNext-style `./x.js` specifiers to their `.ts` sources.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs']
    }
    return config
  }
}

export default nextConfig
