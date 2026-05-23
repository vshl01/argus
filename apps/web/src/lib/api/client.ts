/**
 * Single HTTP client for the whole app.
 *
 * - Centralizes base URL handling (no per-call `${env.apiUrl}/...`).
 * - Normalizes errors into one shape (`ApiError`) so sagas can match on it.
 * - Keeps the API surface tiny: `get`, `post`. Add verbs as features need them.
 *
 * Components never import this directly — they go through hooks → sagas →
 * the per-feature endpoint modules in `src/lib/api/*Api.ts`.
 */

import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | undefined | null;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query?: Query): string {
  const base = env.apiUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  path: string,
  init: RequestInit & { query?: Query } = {},
): Promise<T> {
  const { query, headers, ...rest } = init;
  const url = buildUrl(path, query);

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `${res.status} ${res.statusText}`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // body was not JSON; keep the status text fallback.
    }
    throw new ApiError(res.status, url, message);
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get<T>(path: string, query?: Query): Promise<T> {
    return request<T>(path, { method: "GET", query });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
};
