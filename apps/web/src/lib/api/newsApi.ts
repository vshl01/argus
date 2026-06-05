import { apiClient } from "./client";
import { endpoints } from "@/config/endpoints";
import type { Article } from "@/features/news/newsTypes";

export interface ListNewsArgs {
  /** Filter by coin ticker. If omitted, returns recent across all coins. */
  coin?: string;
  limit?: number;
}

export const newsApi = {
  list({ coin, limit = 50 }: ListNewsArgs = {}): Promise<Article[]> {
    return apiClient.get<Article[]>(endpoints.news, { coin, limit });
  },
};
