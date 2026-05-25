import type { ReactNode } from "react";
import { Text } from "@/components/atoms/Text";

/**
 * "Label + value" tile used in the header stats strip on the coin detail page.
 * Sibling tiles share the same vertical rhythm, so the strip lines up cleanly
 * regardless of which fields are present.
 */
export function StatTile({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="label" tone="tertiary">
        {label}
      </Text>
      <div className="flex items-baseline gap-2">{children}</div>
      {hint ? (
        <Text variant="caption" tone="tertiary">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
