import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";

const INDICATORS: { label: string; description: string }[] = [
  { label: "RSI (14)", description: "Momentum oscillator over the last 14 bars." },
  { label: "MACD", description: "12/26 EMA crossover with 9-bar signal line." },
  { label: "50 MA", description: "Medium-term moving average." },
  { label: "200 MA", description: "Long-term moving average baseline." },
];

/**
 * Coming-soon panel for indicators. Stays in the layout so the right rail
 * doesn't snap into existence when the backend module lands.
 */
export function IndicatorsPlaceholder() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Text variant="subtitle">Indicators</Text>
        <Badge tone="accent">Soon</Badge>
      </div>
      <Text variant="caption" tone="secondary" className="mt-1 block">
        Computed locally from candles. Descriptive, not predictive.
      </Text>
      <ul className="mt-4 flex flex-col gap-3">
        {INDICATORS.map((i) => (
          <li
            key={i.label}
            className="flex items-start justify-between gap-3 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0"
          >
            <div>
              <Text variant="body" className="font-medium">
                {i.label}
              </Text>
              <Text variant="caption" tone="tertiary" className="block">
                {i.description}
              </Text>
            </div>
            <Text variant="mono" tone="tertiary">
              —
            </Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
