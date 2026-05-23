"use client";

import { useEffect } from "react";

import { newsActions } from "@/features/news/newsSlice";
import { newsScopeId } from "@/features/news/newsTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface UseNewsArgs {
  /** Coin ticker to filter by. `null` = global feed. */
  coin?: string | null;
  limit?: number;
}

export function useNews({ coin = null, limit = 50 }: UseNewsArgs = {}) {
  const dispatch = useAppDispatch();
  const normalized = coin ? coin.toUpperCase() : null;
  const id = newsScopeId({ coin: normalized });

  const scope = useAppSelector((s) => s.news.scopes[id]);

  useEffect(() => {
    dispatch(newsActions.requested({ coin: normalized, limit }));
  }, [dispatch, normalized, limit]);

  return {
    articles: scope?.items ?? [],
    status: scope?.status ?? "idle",
    error: scope?.error ?? null,
  };
}
