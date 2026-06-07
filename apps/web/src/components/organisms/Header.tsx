"use client";

import { Kbd } from "@/components/atoms/Kbd";
import { Logo } from "@/components/atoms/Logo";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { useCommandPalette } from "@/components/organisms/CommandPalette";

/**
 * Top app bar: logo (doubles as "home"), a search trigger that opens the
 * command palette, and the theme toggle. The search trigger is the primary
 * way users jump between coins, so it's front and centre.
 */
export function Header() {
  const palette = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        <button
          type="button"
          onClick={palette.open}
          className="group flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border-default bg-surface/60 px-3 text-sm text-text-tertiary transition-colors hover:border-border-strong hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Search coins"
        >
          <SearchGlyph className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search coins…</span>
          <span className="hidden items-center gap-0.5 sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
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
