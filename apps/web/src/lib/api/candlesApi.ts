import { apiClient } from "./client";
import { endpoints } from "@/config/endpoints";
import type { Candle } from "@/features/candles/candlesTypes";

export interface ListCandlesArgs {
  symbol: string;
  interval: string;
  limit?: number;
}

export const candlesApi = {
  list({ symbol, interval, limit = 200 }: ListCandlesArgs): Promise<Candle[]> {
    return apiClient.get<Candle[]>(endpoints.candles(symbol), {
      interval,
      limit,
    });
  },
};
