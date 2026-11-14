/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  serverExternalPackages: ["pg", "firebase-admin", "bcryptjs"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
