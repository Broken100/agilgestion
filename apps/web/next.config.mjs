// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: '/',
  serverExternalPackages: ['pg', 'bcryptjs', '@neondatabase/serverless', 'drizzle-orm'],
};

export default nextConfig;