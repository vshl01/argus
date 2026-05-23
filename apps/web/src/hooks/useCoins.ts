"use client";

import { useEffect, useMemo } from "react";

import { coinsActions } from "@/features/coins/coinsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * Read + subscribe to the coin list.
 *
 * Dispatches the load on first mount; subsequent mounts reuse the cached list
 * unless something has explicitly reset it. Components do not call the API
 * directly — they go through this hook.
 */
export function useCoinList() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.coins.items);
  const list = useAppSelector((s) => s.coins.list);

  useEffect(() => {
    if (list.status === "idle") {
      dispatch(coinsActions.listRequested());
    }
  }, [dispatch, list.status]);

  const coins = useMemo(
    () =>
      Object.values(items).sort(
        (a, b) => (b.market_cap_usd ?? 0) - (a.market_cap_usd ?? 0),
      ),
    [items],
  );

  return { coins, status: list.status, error: list.error };
}

/**
 * Read + subscribe to a single coin. Falls back to the bulk list cache if
 * the detail hasn't been loaded yet, so the page can paint immediately when
 * the user navigates from the home grid.
 */
export function useCoin(symbol: string) {
  const dispatch = useAppDispatch();
  const upper = symbol.toUpperCase();

  const coin = useAppSelector((s) => s.coins.items[upper]);
  const detail = useAppSelector((s) => s.coins.detail[upper]);

  useEffect(() => {
    if (!detail || detail.status === "idle") {
      dispatch(coinsActions.detailRequested({ symbol: upper }));
    }
  }, [dispatch, upper, detail]);

  return {
    coin,
    status: detail?.status ?? "idle",
    error: detail?.error ?? null,
  };
}
