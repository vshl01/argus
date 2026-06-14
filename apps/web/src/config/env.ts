const API_URL_DEFAULT = "http://localhost:3000";

export const env = {
  /** Base URL of the Argus backend API, without a trailing slash. */
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? API_URL_DEFAULT).replace(
    /\/$/,
    "",
  ),
} as const;
