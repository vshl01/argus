"use client";

import { HomeHero } from "@/components/organisms/HomeHero";
import { MarketStats } from "@/components/organisms/MarketStats";
import { MarketsPanel } from "@/components/organisms/MarketsPanel";
import { NewsList } from "@/components/organisms/NewsList";
import { TopMovers } from "@/components/organisms/TopMovers";
import { PageShell } from "./PageShell";

/**
 * Home: a hero band that frames the product, a global market strip, then the
 * live markets browser with the latest news on the side (wide screens) or
 * below (narrow).
 */
export function HomeTemplate() {
  return (
    <PageShell>
      <HomeHero />

      <div className="flex flex-col gap-8">
        <MarketStats />
        <TopMovers />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <MarketsPanel />

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              {/* Fixed height ≈ 5 cards; the rest scrolls inside the rail. */}
              <NewsList
                title="Latest news"
                limit={40}
                fill
                className="h-182"
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-10 lg:hidden">
        <NewsList title="Latest news" limit={40} fill className="h-182" />
      </div>
    </PageShell>
  );
}
