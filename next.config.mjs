/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  /* CR §5 architecture: Downloads replaces Catalogue; Corporate folds into About */
  async redirects() {
    return [
      { source: '/catalog', destination: '/downloads', permanent: true },
      { source: '/catalog/:path*', destination: '/downloads/:path*', permanent: true },
      { source: '/corporate', destination: '/about', permanent: true },
    ];
  },
};
export default nextConfig;
