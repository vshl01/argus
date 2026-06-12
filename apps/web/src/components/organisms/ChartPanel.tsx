"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
  createSeriesMarkers,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { useCandles } from "@/hooks/useCandles";
import { useCoin } from "@/hooks/useCoins";
import { useNews } from "@/hooks/useNews";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { isoToEpochSeconds } from "@/lib/formatters/time";
import { formatPrice } from "@/lib/formatters/price";
import {
  SUPPORTED_INTERVALS,
  type Interval,
} from "@/features/candles/candlesTypes";

interface OhlcLegend {
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * TradingView Lightweight Charts wrapped behind a React lifecycle.
 *
 * Strategy:
 *   - Chart instance is created once on mount and disposed on unmount.
 *   - Candles + news refresh via separate effects that just call `setData`
 *     / `setMarkers` on the existing series. No re-creation, no flicker.
 *   - A crosshair subscription drives the live OHLC legend.
 *   - Theme changes update the chart's color options in place.
 *
 * News markers overlaid on price is Argus's whole differentiator.
 */
export function ChartPanel({ symbol }: { symbol: string }) {
  const [interval, setInterval] = useState<Interval>("1h");

  const { candles, status: candlesStatus } = useCandles({ symbol, interval });
  const { articles } = useNews({ coin: symbol, limit: 200 });
  const { coin } = useCoin(symbol);
  const { theme } = useTheme();

  const [legend, setLegend] = useState<OhlcLegend | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const lastPrice = candles.length > 0 ? candles[candles.length - 1]!.close : null;

  // -------------------------------------------------------------------------
  // Lifecycle: create the chart once.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: readVar("--text-secondary"),
        fontFamily: "var(--font-sans)",
      },
      grid: {
        vertLines: { color: readVar("--border-subtle") },
        horzLines: { color: readVar("--border-subtle") },
      },
      rightPriceScale: { borderColor: readVar("--border-subtle") },
      timeScale: {
        borderColor: readVar("--border-subtle"),
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: readVar("--positive"),
      downColor: readVar("--negative"),
      borderUpColor: readVar("--positive"),
      borderDownColor: readVar("--negative"),
      wickUpColor: readVar("--positive"),
      wickDownColor: readVar("--negative"),
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      color: readVar("--border-default"),
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    markersRef.current = createSeriesMarkers(candleSeries, []);

    // Live OHLC legend: read the hovered bar off the crosshair param.
    chart.subscribeCrosshairMove((param) => {
      const data = param.seriesData.get(candleSeries) as
        | CandlestickData
        | undefined;
      if (!data) {
        setLegend(null);
        return;
      }
      setLegend({
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
      });
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Push candles whenever they change.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const cs = candleSeriesRef.current;
    const vs = volumeSeriesRef.current;
    if (!cs || !vs || candles.length === 0) return;

    cs.setData(
      candles.map((c) => ({
        time: isoToEpochSeconds(c.ts) as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    const upColor = readVar("--positive-soft");
    const downColor = readVar("--negative-soft");
    vs.setData(
      candles.map((c) => ({
        time: isoToEpochSeconds(c.ts) as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? upColor : downColor,
      })),
    );

    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // -------------------------------------------------------------------------
  // News markers — snap each article to the candle bucket that contains it,
  // since lightweight-charts drops markers whose time doesn't match a bar.
  // -------------------------------------------------------------------------
  const markers = useMemo<SeriesMarker<Time>[]>(() => {
    if (candles.length === 0) return [];
    const candleTimes = candles.map((c) => isoToEpochSeconds(c.ts));
    const firstTs = candleTimes[0]!;
    const lastTs = candleTimes[candleTimes.length - 1]!;

    const snapToBar = (t: number): number => {
      let lo = 0;
      let hi = candleTimes.length - 1;
      let ans = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (candleTimes[mid]! <= t) {
          ans = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return candleTimes[ans]!;
    };

    const accent = readVar("--accent");
    return articles
      .filter((a) => a.published)
      .map((a) => ({ article: a, t: isoToEpochSeconds(a.published!) }))
      .filter(({ t }) => t >= firstTs && t <= lastTs)
      .map(({ article, t }) => ({
        time: snapToBar(t) as UTCTimestamp,
        position: "aboveBar" as const,
        color: accent,
        shape: "circle" as const,
        text:
          article.title.length > 40
            ? `${article.title.slice(0, 40)}…`
            : article.title,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, [articles, candles]);

  useEffect(() => {
    markersRef.current?.setMarkers(markers);
  }, [markers]);

  // -------------------------------------------------------------------------
  // Theme swap — re-read the CSS vars now that they point at new values.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const chart = chartRef.current;
    const cs = candleSeriesRef.current;
    const vs = volumeSeriesRef.current;
    if (!chart || !cs || !vs) return;

    chart.applyOptions({
      layout: {
        background: { color: "transparent" },
        textColor: readVar("--text-secondary"),
      },
      grid: {
        vertLines: { color: readVar("--border-subtle") },
        horzLines: { color: readVar("--border-subtle") },
      },
      rightPriceScale: { borderColor: readVar("--border-subtle") },
      timeScale: { borderColor: readVar("--border-subtle") },
    });
    cs.applyOptions({
      upColor: readVar("--positive"),
      downColor: readVar("--negative"),
      borderUpColor: readVar("--positive"),
      borderDownColor: readVar("--negative"),
      wickUpColor: readVar("--positive"),
      wickDownColor: readVar("--negative"),
    });
  }, [theme]);

  const intervalOptions = useMemo(
    () => SUPPORTED_INTERVALS.map((i) => ({ value: i, label: i })),
    [],
  );

  return (
    <Card
      variant="raised"
      className="flex h-120 flex-col overflow-hidden md:h-140 xl:h-170"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
        <div className="flex items-baseline gap-3">
          <div>
            <Text variant="label" tone="tertiary">
              {symbol} · Price
            </Text>
            <div className="mt-0.5 flex items-center gap-2">
              <Text variant="subtitle" numeric className="text-xl">
                {formatPrice(lastPrice)}
              </Text>
              <ChangeBadge value={coin?.change_24h_pct} size="sm" />
            </div>
          </div>
        </div>
        <SegmentedControl
          size="sm"
          options={intervalOptions}
          value={interval}
          onChange={setInterval}
        />
      </div>

      <div className="relative min-h-0 w-full flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Live OHLC legend (top-left overlay). */}
        {legend ? (
          <div className="pointer-events-none absolute left-3 top-3 flex gap-3 rounded-lg border border-border-subtle bg-surface/80 px-3 py-1.5 text-xs backdrop-blur">
            <OhlcField label="O" value={legend.open} />
            <OhlcField label="H" value={legend.high} />
            <OhlcField label="L" value={legend.low} />
            <OhlcField label="C" value={legend.close} />
          </div>
        ) : (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border-subtle bg-surface/80 px-3 py-1.5 text-xs text-text-tertiary backdrop-blur">
            {markers.length > 0
              ? `${markers.length} news marker${markers.length === 1 ? "" : "s"} in view`
              : "Hover for OHLC"}
          </div>
        )}

        {candlesStatus === "loading" && candles.length === 0 ? (
          <div className="absolute inset-0 p-2">
            <Skeleton className="h-full w-full" />
          </div>
        ) : null}

        {candlesStatus === "error" && candles.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Text variant="caption" tone="tertiary">
              No candle data available for {symbol}.
            </Text>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function OhlcField({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-text-tertiary">{label}</span>
      <span className="num font-medium text-text-primary">
        {formatPrice(value)}
      </span>
    </span>
  );
}

/** Resolve a CSS variable's *current* value from the document root. */
function readVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
