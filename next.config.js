/** @type {import('next').NextConfig} */
const nextConfig = {
  // Las páginas legales antiguas (/legal/...) se sustituyeron por las
  // definitivas de 05/11/2026. Se redirigen para no romper enlaces ya
  // enviados (emails, facturas, etc.).
  async redirects() {
    return [
      { source: "/legal/terminos", destination: "/terminos", permanent: true },
      { source: "/legal/privacidad", destination: "/aviso-legal", permanent: true },
      { source: "/legal/aviso-legal", destination: "/aviso-legal", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

module.exports = nextConfig;