import { call, put, takeLatest, type SagaReturnType } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";

import { newsApi } from "@/lib/api/newsApi";
import { ApiError } from "@/lib/api/client";
import { newsActions } from "./newsSlice";
import type { NewsScopeKey } from "./newsTypes";

function describe(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "unknown error";
}

function* loadNews(
  action: PayloadAction<NewsScopeKey & { limit?: number }>,
) {
  const { coin, limit } = action.payload;
  const key: NewsScopeKey = { coin };
  try {
    const items: SagaReturnType<typeof newsApi.list> = yield call(newsApi.list, {
      coin: coin ?? undefined,
      limit,
    });
    yield put(newsActions.succeeded({ key, items }));
  } catch (err) {
    yield put(newsActions.failed({ key, error: describe(err) }));
  }
}

export function* newsSaga() {
  yield takeLatest(newsActions.requested.type, loadNews);
}
