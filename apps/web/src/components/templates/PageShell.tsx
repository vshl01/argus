"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { Header } from "@/components/organisms/Header";

/**
 * App-level frame: a fixed ambient backdrop, the sticky header, and a
 * constrained content well. Every page renders inside this so spacing,
 * max-width, the header, and the cross-page fade stay consistent.
 */
export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-dvh bg-canvas">
      {/* Ambient backdrop — fixed so it doesn't scroll with content. */}
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-aurora" aria-hidden />

      <div className="relative">
        <Header />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
