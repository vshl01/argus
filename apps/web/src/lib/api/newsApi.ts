import { apiClient } from "./client";
import type { Article } from "@/features/news/newsTypes";

export interface ListNewsArgs {
  /** Filter by coin ticker. If omitted, returns recent across all coins. */
  coin?: string;
  limit?: number;
}

export const newsApi = {
  list({ coin, limit = 50 }: ListNewsArgs = {}): Promise<Article[]> {
    return apiClient.get<Article[]>("/news", { coin, limit });
  },
};
