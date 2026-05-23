import { configureStore, type ThunkAction, type Action } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { candlesReducer } from "@/features/candles/candlesSlice";
import { coinsReducer } from "@/features/coins/coinsSlice";
import { newsReducer } from "@/features/news/newsSlice";
import { rootSaga } from "./rootSaga";

/**
 * Builds the Redux store with the saga middleware attached.
 *
 * Exposed as a factory so Next.js can instantiate one store per server-render
 * and a single store on the client. Today we only call it once on the client
 * (see `app/providers.tsx`), but having the factory ready avoids the SSR
 * "shared store" hydration footgun if/when we add server data later.
 */
export function makeStore() {
  const saga = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      coins: coinsReducer,
      candles: candlesReducer,
      news: newsReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        // Sagas don't dispatch thunks; disabling shaves ~1ms per dispatch.
        thunk: false,
      }).concat(saga),
  });

  saga.run(rootSaga);

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action>;
