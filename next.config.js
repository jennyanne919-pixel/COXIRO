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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

module.exports = nextConfig;