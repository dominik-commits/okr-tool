/** @type {import('next').NextConfig} */
const nextConfig = {
  // Der Zeitstrahl liegt als statische Seite in /public (durch middleware.ts passwortgeschützt).
  async rewrites() {
    return { beforeFiles: [{ source: '/', destination: '/zeitstrahl.html' }] };
  },
  async headers() {
    return [{ source: '/zeitstrahl.html', headers: [{ key: 'Cache-Control', value: 'no-store' }] }];
  },
};
module.exports = nextConfig;
