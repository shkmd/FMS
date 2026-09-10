/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@fms/shared"],
  reactStrictMode: true,
  experimental: {
    // keep Leaflet (which touches `window`) out of the RSC bundle
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
