/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for Hostinger shared hosting
  output: 'export',
  trailingSlash: true,           // Hostinger needs /page/ not /page
  images: { unoptimized: true }, // Required for static export
  // Allow pdf-lib and other browser-only packages
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
