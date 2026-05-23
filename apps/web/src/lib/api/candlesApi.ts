import { apiClient } from "./client";
import type { Candle } from "@/features/candles/candlesTypes";

export interface ListCandlesArgs {
  symbol: string;
  interval: string;
  limit?: number;
}

export const candlesApi = {
  list({ symbol, interval, limit = 200 }: ListCandlesArgs): Promise<Candle[]> {
    return apiClient.get<Candle[]>(
      `/coins/${encodeURIComponent(symbol)}/candles`,
      { interval, limit },
    );
  },
};
