"use client";

import { useEffect, useMemo } from "react";

import { candlesActions } from "@/features/candles/candlesSlice";
import { seriesId } from "@/features/candles/candlesTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface UseCandlesArgs {
  symbol: string;
  interval: string;
  limit?: number;
}

/**
 * Read + subscribe to a candle series. Dispatches the load on mount and
 * when `(symbol, interval)` changes; the saga uses `takeLatest`, so any
 * in-flight request for the previous combo is cancelled cleanly.
 */
export function useCandles({ symbol, interval, limit = 200 }: UseCandlesArgs) {
  const dispatch = useAppDispatch();
  const upper = symbol.toUpperCase();
  const id = seriesId({ symbol: upper, interval });

  const series = useAppSelector((s) => s.candles.series[id]);

  useEffect(() => {
    dispatch(
      candlesActions.requested({ symbol: upper, interval, limit }),
    );
  }, [dispatch, upper, interval, limit]);

  const candles = useMemo(() => {
    if (!series?.data) return [];
    // Backend returns newest-first; chart wants oldest-first.
    return [...series.data].reverse();
  }, [series?.data]);

  return {
    candles,
    status: series?.status ?? "idle",
    error: series?.error ?? null,
  };
}
