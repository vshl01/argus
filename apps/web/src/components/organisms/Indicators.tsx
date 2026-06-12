"use client";

import { useMemo } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { useCandles } from "@/hooks/useCandles";
import { formatPrice } from "@/lib/formatters/price";
import { rsi, rsiZone, sma } from "@/lib/indicators";
import { cn } from "@/lib/cn";

/**
 * Technical indicators computed locally from the same 1h candles the chart
 * uses. Descriptive, never predictive — and honest about missing data (shows
 * "—" when there aren't enough bars to compute a value).
 */
export function Indicators({ symbol }: { symbol: string }) {
  const { candles, status } = useCandles({ symbol, interval: "1h" });

  const values = useMemo(() => {
    const closes = candles.map((c) => c.close);
    return {
      rsi: rsi(closes, 14),
      sma50: sma(closes, 50),
      sma200: sma(closes, 200),
      bars: closes.length,
    };
  }, [candles]);

  const loading = status === "loading" && candles.length === 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Text variant="subtitle">Indicators</Text>
        <Text variant="caption" tone="tertiary">
          1h · {values.bars} bars
        </Text>
      </div>
      <Text variant="caption" tone="secondary" className="mt-1 block">
        Computed locally from candles. Descriptive, not predictive.
      </Text>

      <ul className="mt-4 flex flex-col gap-3">
        <li className="border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
          <RsiRow value={loading ? null : values.rsi} loading={loading} />
        </li>
        <li className="border-t border-border-subtle pt-3">
          <Row
            label="SMA 50"
            hint="50-bar simple moving average"
            value={loading ? null : values.sma50}
            loading={loading}
          />
        </li>
        <li className="border-t border-border-subtle pt-3">
          <Row
            label="SMA 200"
            hint="200-bar simple moving average"
            value={loading ? null : values.sma200}
            loading={loading}
          />
        </li>
      </ul>
    </Card>
  );
}

function Row({
  label,
  hint,
  value,
  loading,
}: {
  label: string;
  hint: string;
  value: number | null;
  loading: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Text variant="body" className="font-medium">
          {label}
        </Text>
        <Text variant="caption" tone="tertiary" className="block">
          {hint}
        </Text>
      </div>
      <Text variant="mono" tone={value == null ? "tertiary" : "primary"}>
        {loading ? "…" : value == null ? "—" : formatPrice(value)}
      </Text>
    </div>
  );
}

function RsiRow({ value, loading }: { value: number | null; loading: boolean }) {
  const zone = value != null ? rsiZone(value) : null;
  const tone =
    zone === "oversold" ? "positive" : zone === "overbought" ? "negative" : "neutral";

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Text variant="body" className="font-medium">
          RSI (14)
        </Text>
        <Text variant="caption" tone="tertiary" className="block">
          Momentum · &lt;30 oversold, &gt;70 overbought
        </Text>
        {value != null ? (
          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-overlay">
            <div
              className={cn(
                "h-full rounded-full",
                tone === "positive"
                  ? "bg-positive"
                  : tone === "negative"
                    ? "bg-negative"
                    : "bg-border-strong",
              )}
              style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1">
        <Text variant="mono" tone={value == null ? "tertiary" : "primary"}>
          {loading ? "…" : value == null ? "—" : value.toFixed(1)}
        </Text>
        {zone ? (
          <Badge tone={tone} className="text-[10px] capitalize">
            {zone}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
