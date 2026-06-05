import { apiClient } from "./client";
import { endpoints } from "@/config/endpoints";
import type { Coin } from "@/features/coins/coinsTypes";

/** Thin, type-safe wrappers around the `/coins` endpoints. */
export const coinsApi = {
  list(): Promise<Coin[]> {
    return apiClient.get<Coin[]>(endpoints.coins);
  },
  get(symbol: string): Promise<Coin> {
    return apiClient.get<Coin>(endpoints.coin(symbol));
  },
};
