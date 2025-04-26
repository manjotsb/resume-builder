/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      esmExternals: true, // Changed to true
      appDir: true,
      serverComponentsExternalPackages: ['pdf-lib', 'mammoth'] // Add problematic packages here
    },
    webpack: (config) => {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      }
      return config
    }
  }
  
  export default nextConfig