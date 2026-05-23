/**
 * Runtime environment configuration.
 *
 * Only `NEXT_PUBLIC_*` variables are accessible client-side. We surface them
 * here once, with explicit defaults, so the rest of the app reads from one
 * place instead of sprinkling `process.env` lookups everywhere.
 */

const API_URL_DEFAULT = "http://localhost:3000";

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? API_URL_DEFAULT,
} as const;
