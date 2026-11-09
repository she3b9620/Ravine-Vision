const MAX_DISPLAY_NAME_LENGTH = 80;

type UserMetadata = Record<string, unknown> | null | undefined;

function normalize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Pick a human-readable display name from identity-provider metadata.
 *
 * RAVINE email sign-up stores `display_name`; Google OAuth returns
 * `full_name` (and the same value in `name`). Returning "" is deliberate:
 * callers show a neutral member label rather than leaking the email address
 * as a public display name.
 */
export function resolveDisplayName(metadata: UserMetadata): string {
  if (!metadata) return "";
  for (const key of ["display_name", "full_name", "name"] as const) {
    const value = normalize(metadata[key]);
    if (value) return value.slice(0, MAX_DISPLAY_NAME_LENGTH).trimEnd();
  }
  return "";
}
