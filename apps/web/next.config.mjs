/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace paketlerini doğrudan kaynak TS olarak transpile et (ayrı build adımı yok).
  transpilePackages: ['@clickthru/ui', '@clickthru/schema'],
  // Lint ayrı adımda (root `pnpm lint`) — build'i lint'e bağlamıyoruz.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
