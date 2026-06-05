import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { PageShell } from "@/components/templates/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Text variant="display" className="text-gradient">
          404
        </Text>
        <Text variant="subtitle" tone="secondary" className="mt-3">
          This page drifted off the chart.
        </Text>
        <Text variant="body" tone="tertiary" className="mt-1 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist — or the coin
          isn&apos;t tracked.
        </Text>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-text-inverse shadow-glow transition-colors hover:bg-accent-hover"
        >
          Back to markets
        </Link>
      </div>
    </PageShell>
  );
}
