import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Coin } from "./coinsTypes";

/**
 * Coins slice — stores the full coin list keyed by symbol.
 *
 * Two requests funnel into the same map: the bulk list (home page) and the
 * per-coin detail fetch. Saga writes both into `items` so any selector sees
 * the freshest known value regardless of which endpoint loaded it.
 */

export type LoadState = "idle" | "loading" | "ready" | "error";

export interface CoinsState {
  items: Record<string, Coin>;
  list: {
    status: LoadState;
    error: string | null;
  };
  detail: Record<string, { status: LoadState; error: string | null }>;
}

const initialState: CoinsState = {
  items: {},
  list: { status: "idle", error: null },
  detail: {},
};

const slice = createSlice({
  name: "coins",
  initialState,
  reducers: {
    // List ----------------------------------------------------------------
    listRequested(state) {
      state.list.status = "loading";
      state.list.error = null;
    },
    listSucceeded(state, action: PayloadAction<Coin[]>) {
      state.list.status = "ready";
      state.list.error = null;
      for (const coin of action.payload) {
        state.items[coin.symbol] = coin;
      }
    },
    listFailed(state, action: PayloadAction<string>) {
      state.list.status = "error";
      state.list.error = action.payload;
    },

    // Detail --------------------------------------------------------------
    detailRequested(state, action: PayloadAction<{ symbol: string }>) {
      const symbol = action.payload.symbol.toUpperCase();
      state.detail[symbol] = { status: "loading", error: null };
    },
    detailSucceeded(state, action: PayloadAction<Coin>) {
      const symbol = action.payload.symbol.toUpperCase();
      state.items[symbol] = action.payload;
      state.detail[symbol] = { status: "ready", error: null };
    },
    detailFailed(
      state,
      action: PayloadAction<{ symbol: string; error: string }>,
    ) {
      const symbol = action.payload.symbol.toUpperCase();
      state.detail[symbol] = { status: "error", error: action.payload.error };
    },
  },
});

export const coinsActions = slice.actions;
export const coinsReducer = slice.reducer;
