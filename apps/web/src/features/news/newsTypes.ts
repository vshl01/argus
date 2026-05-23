/** News article returned by `GET /news`. */
export interface Article {
  source: string;
  title: string;
  link: string;
  snippet: string;
  published: string | null;
  coins: string[];
}

/**
 * Storage key for a news query. We separate "all" from "by coin" because the
 * home-page news widget and the per-coin overlay want different selectors.
 */
export interface NewsScopeKey {
  /** Uppercase ticker, or `null` for the global feed. */
  coin: string | null;
}

export function newsScopeId({ coin }: NewsScopeKey): string {
  return coin ?? "__all__";
}
