import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The preview is opened at 127.0.0.1, and also through a temporary public tunnel.
  // Next only trusts localhost unless we name the other hosts.
  allowedDevOrigins: ["127.0.0.1", "differently-hart-ron-techrepublic.trycloudflare.com"],
  async redirects() {
    return [
      { source: "/collection/call-it-clean-sweep", destination: "/collection/fela-the-goat", permanent: true },
      { source: "/collect/call-it-clean-sweep", destination: "/collect/fela-the-goat", permanent: true },
      { source: "/call-it-clean-sweep.webp", destination: "/fela-the-goat.webp", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ]
  },
  transpilePackages: [
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-phantom",
    "@solana/wallet-adapter-solflare",
  ],
};

export default nextConfig;
