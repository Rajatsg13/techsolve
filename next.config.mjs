/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fixed build ID so _next/static/ts44/ never changes name between deploys
  generateBuildId: async () => 'ts44',
  // Static export for Hostinger shared hosting
  output: 'export',
  trailingSlash: true,           // Hostinger needs /page/ not /page
  images: { unoptimized: true }, // Required for static export
  // Tree-shake large packages — only bundle components actually imported
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  // Allow pdf-lib and other browser-only packages
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false,
      worker_threads: false,
    };
    return config;
  },
};

export default nextConfig;
