/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow running multiple instances
  async rewrites() {
    return [
      {
        source: '/senior/:path*',
        destination: '/senior/:path*',
      },
    ]
  },
}

export default nextConfig
