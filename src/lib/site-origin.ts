import { headers } from "next/headers";

const HOST_PATTERN = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/i;

/**
 * Derive the public origin used for auth redirects from proxy headers.
 *
 * Vercel (and most proxies) set x-forwarded-host/proto. Values are validated
 * before use: an unchecked Host header would turn the OAuth redirect into an
 * open redirect, so anything that is not a plain hostname is rejected.
 */
export function originFromHeaders(source: Headers): string | null {
  const rawHost = source.get("x-forwarded-host") ?? source.get("host");
  if (!rawHost) return null;

  // Proxies may append additional hosts; the first entry is the original.
  const host = rawHost.split(",")[0].trim().toLowerCase();
  if (!host || !HOST_PATTERN.test(host)) return null;

  const rawProto = (source.get("x-forwarded-proto") ?? "https").split(",")[0].trim().toLowerCase();
  const proto = rawProto === "http" ? "http" : "https";

  return `${proto}://${host}`;
}

/**
 * Absolute origin for email confirmation and OAuth callback URLs.
 *
 * An explicit NEXT_PUBLIC_SITE_URL always wins. Otherwise the origin is taken
 * from the current request, which keeps production redirects on the real domain
 * even when the variable is absent — previously the fallback was a hardcoded
 * http://localhost:3000, which pointed every confirmation email at localhost.
 */
export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const derived = originFromHeaders(await headers());
  if (derived) return derived;

  return "http://localhost:3000";
}
