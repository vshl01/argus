import { all, fork } from "redux-saga/effects";

import { candlesSaga } from "@/features/candles/candlesSaga";
import { coinsSaga } from "@/features/coins/coinsSaga";
import { newsSaga } from "@/features/news/newsSaga";

export function* rootSaga() {
  yield all([fork(coinsSaga), fork(candlesSaga), fork(newsSaga)]);
}
