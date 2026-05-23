import { call, put, takeLatest, type SagaReturnType } from "redux-saga/effects";

import { coinsApi } from "@/lib/api/coinsApi";
import { ApiError } from "@/lib/api/client";
import { coinsActions } from "./coinsSlice";
import type { PayloadAction } from "@reduxjs/toolkit";

function describe(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "unknown error";
}

function* loadList() {
  try {
    const data: SagaReturnType<typeof coinsApi.list> = yield call(
      coinsApi.list,
    );
    yield put(coinsActions.listSucceeded(data));
  } catch (err) {
    yield put(coinsActions.listFailed(describe(err)));
  }
}

function* loadDetail(action: PayloadAction<{ symbol: string }>) {
  const { symbol } = action.payload;
  try {
    const data: SagaReturnType<typeof coinsApi.get> = yield call(
      coinsApi.get,
      symbol,
    );
    yield put(coinsActions.detailSucceeded(data));
  } catch (err) {
    yield put(
      coinsActions.detailFailed({ symbol, error: describe(err) }),
    );
  }
}

export function* coinsSaga() {
  yield takeLatest(coinsActions.listRequested.type, loadList);
  yield takeLatest(coinsActions.detailRequested.type, loadDetail);
}
