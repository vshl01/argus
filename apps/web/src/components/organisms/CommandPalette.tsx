"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { Kbd } from "@/components/atoms/Kbd";
import { CoinIcon } from "@/components/molecules/CoinIcon";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { useCoinList } from "@/hooks/useCoins";
import { cn } from "@/lib/cn";
import { formatCompactCurrency } from "@/lib/formatters/price";

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

/**
 * App-wide coin search / command palette. Opens with ⌘K (Ctrl-K) or by
 * calling `open()` from any component (the header search trigger does this).
 * Fuzzy-matches the live coin list, supports full keyboard nav, and routes to
 * the coin detail page on select — this is the backbone of moving around the
 * app without reaching for the mouse.
 */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Global ⌘K / Ctrl-K listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo(
    () => ({ open, close, toggle, isOpen }),
    [open, close, toggle, isOpen],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <PaletteModal isOpen={isOpen} onClose={close} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used inside <CommandPaletteProvider />",
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------

function PaletteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { coins } = useCoinList();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset query + selection and focus the field each time it opens.
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActive(0);
      // Focus after the enter animation frame so the caret lands reliably.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins.slice(0, 8);
    return coins
      .filter(
        (c) =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [coins, query]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  const go = useCallback(
    (symbol: string) => {
      onClose();
      router.push(`/coins/${symbol}`);
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const coin = results[active];
      if (coin) go(coin.symbol);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll the active row into view on keyboard nav.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search coins"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-default bg-surface shadow-lg"
            onKeyDown={onKeyDown}
          >
            {/* Search field */}
            <div className="flex items-center gap-3 border-b border-border-subtle px-4">
              <SearchGlyph className="h-4 w-4 shrink-0 text-text-tertiary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coins by name or ticker…"
                className="h-14 w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-tertiary"
              />
              <Kbd>esc</Kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="thin-scrollbar max-h-[52vh] overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-text-tertiary">
                  No coins match “{query}”.
                </div>
              ) : (
                results.map((coin, i) => (
                  <button
                    key={coin.symbol}
                    type="button"
                    data-idx={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(coin.symbol)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      i === active ? "bg-overlay" : "hover:bg-overlay",
                    )}
                  >
                    <CoinIcon src={coin.icon_url} symbol={coin.symbol} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text-primary">
                        {coin.name}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {coin.symbol}
                      </div>
                    </div>
                    <span className="num hidden text-xs text-text-tertiary sm:block">
                      {formatCompactCurrency(coin.market_cap_usd)}
                    </span>
                    <ChangeBadge value={coin.change_24h_pct} size="sm" />
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2.5 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                to open
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
