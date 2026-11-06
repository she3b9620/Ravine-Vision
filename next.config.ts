import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * Deliberately conservative and framework-safe:
 * - No Content-Security-Policy yet. Next.js injects inline bootstrap scripts and
 *   the app uses inline style attributes, so a correct CSP needs a per-request
 *   nonce strategy. Shipping a permissive-but-broken CSP would be worse than
 *   none, so that decision is recorded as OPEN in docs/OPEN_DECISIONS.md.
 * - camera and microphone are intentionally NOT denied: RAVINE plans Live
 *   audio/video experiences, and a deny would have to be reversed later.
 * - HSTS is already sent by the Vercel platform, so it is not duplicated here.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // SAMEORIGIN rather than DENY: blocks third-party clickjacking while
          // leaving room for first-party embeds. Revisit before any public
          // embedding feature.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
