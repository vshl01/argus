import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { seriesId, type Candle, type CandlesSeriesKey } from "./candlesTypes";

/**
 * Candles slice — one entry per (symbol, interval) pair. We keep the
 * compound key explicit so the chart can swap intervals without losing
 * the cached series for the previous one.
 */

export type LoadState = "idle" | "loading" | "ready" | "error";

export interface SeriesState {
  status: LoadState;
  error: string | null;
  data: Candle[];
}

export interface CandlesState {
  series: Record<string, SeriesState>;
}

const initialState: CandlesState = { series: {} };

const empty = (): SeriesState => ({
  status: "idle",
  error: null,
  data: [],
});

const slice = createSlice({
  name: "candles",
  initialState,
  reducers: {
    requested(
      state,
      action: PayloadAction<CandlesSeriesKey & { limit?: number }>,
    ) {
      const id = seriesId(action.payload);
      const existing = state.series[id] ?? empty();
      state.series[id] = { ...existing, status: "loading", error: null };
    },
    succeeded(
      state,
      action: PayloadAction<{ key: CandlesSeriesKey; data: Candle[] }>,
    ) {
      const id = seriesId(action.payload.key);
      state.series[id] = {
        status: "ready",
        error: null,
        data: action.payload.data,
      };
    },
    failed(
      state,
      action: PayloadAction<{ key: CandlesSeriesKey; error: string }>,
    ) {
      const id = seriesId(action.payload.key);
      const existing = state.series[id] ?? empty();
      state.series[id] = {
        ...existing,
        status: "error",
        error: action.payload.error,
      };
    },
  },
});

export const candlesActions = slice.actions;
export const candlesReducer = slice.reducer;
