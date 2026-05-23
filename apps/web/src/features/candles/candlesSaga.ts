import { call, put, takeLatest, type SagaReturnType } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";

import { candlesApi } from "@/lib/api/candlesApi";
import { ApiError } from "@/lib/api/client";
import { candlesActions } from "./candlesSlice";
import type { CandlesSeriesKey } from "./candlesTypes";

function describe(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "unknown error";
}

function* loadCandles(
  action: PayloadAction<CandlesSeriesKey & { limit?: number }>,
) {
  const { symbol, interval, limit } = action.payload;
  const key: CandlesSeriesKey = { symbol, interval };
  try {
    const data: SagaReturnType<typeof candlesApi.list> = yield call(
      candlesApi.list,
      { symbol, interval, limit },
    );
    yield put(candlesActions.succeeded({ key, data }));
  } catch (err) {
    yield put(candlesActions.failed({ key, error: describe(err) }));
  }
}

export function* candlesSaga() {
  yield takeLatest(candlesActions.requested.type, loadCandles);
}
