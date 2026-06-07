import Link from "next/link";
import { Text } from "./Text";

/**
 * Brand mark in the header — a small "eye" glyph (Argus, the all-seeing) on an
 * accent tile, plus the wordmark. Links home; the glyph scales subtly on hover.
 */
export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex shrink-0 items-center gap-2.5"
      aria-label="Argus home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-text-inverse shadow-glow transition-transform duration-200 group-hover:scale-105">
        <EyeGlyph />
      </span>
      <Text variant="subtitle" className="font-semibold tracking-tight">
        Argus
      </Text>
    </Link>
  );
}

function EyeGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
