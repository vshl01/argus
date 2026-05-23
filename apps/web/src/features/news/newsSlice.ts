import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { newsScopeId, type Article, type NewsScopeKey } from "./newsTypes";

/**
 * News slice — one entry per "scope" (the global feed, or a per-coin feed).
 * Storing them separately lets the home page and a coin detail page coexist
 * without one overwriting the other on remount.
 */

export type LoadState = "idle" | "loading" | "ready" | "error";

export interface ScopeState {
  status: LoadState;
  error: string | null;
  items: Article[];
}

export interface NewsState {
  scopes: Record<string, ScopeState>;
}

const initialState: NewsState = { scopes: {} };

const empty = (): ScopeState => ({
  status: "idle",
  error: null,
  items: [],
});

const slice = createSlice({
  name: "news",
  initialState,
  reducers: {
    requested(state, action: PayloadAction<NewsScopeKey & { limit?: number }>) {
      const id = newsScopeId(action.payload);
      const existing = state.scopes[id] ?? empty();
      state.scopes[id] = { ...existing, status: "loading", error: null };
    },
    succeeded(
      state,
      action: PayloadAction<{ key: NewsScopeKey; items: Article[] }>,
    ) {
      const id = newsScopeId(action.payload.key);
      state.scopes[id] = {
        status: "ready",
        error: null,
        items: action.payload.items,
      };
    },
    failed(
      state,
      action: PayloadAction<{ key: NewsScopeKey; error: string }>,
    ) {
      const id = newsScopeId(action.payload.key);
      const existing = state.scopes[id] ?? empty();
      state.scopes[id] = {
        ...existing,
        status: "error",
        error: action.payload.error,
      };
    },
  },
});

export const newsActions = slice.actions;
export const newsReducer = slice.reducer;
