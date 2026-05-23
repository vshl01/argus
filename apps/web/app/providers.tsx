"use client";

import { useRef, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { makeStore, type AppStore } from "@/store/store";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

/**
 * Client-side providers wrapping the entire app. Kept thin on purpose —
 * the heavy lifting lives in the store/saga modules.
 */
export function Providers({ children }: { children: ReactNode }) {
  // `useRef` keeps a single store instance for the lifetime of the client
  // tree. (Re-creating the store on re-render would clobber all in-flight
  // sagas.)
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <ReduxProvider store={storeRef.current}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  );
}
