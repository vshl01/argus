import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/lib/cn";

/** Coin icon with a typed-letter fallback when the URL is missing or broken. */
export function CoinIcon({
  src,
  symbol,
  size = 32,
  className,
}: {
  src: string | null | undefined;
  symbol: string;
  size?: number;
  className?: string;
}) {
  // Pick a stable accent color for the fallback based on the first character.
  const fallbackBg = useMemo(() => {
    // Token-driven tints; never raw hex.
    const palette = [
      "bg-accent-soft text-accent",
      "bg-positive-soft text-positive",
      "bg-negative-soft text-negative",
    ];
    const idx = (symbol.charCodeAt(0) ?? 0) % palette.length;
    return palette[idx];
  }, [symbol]);

  if (!src) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-full text-xs font-semibold",
          fallbackBg,
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {symbol.slice(0, 1)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      unoptimized
    />
  );
}
