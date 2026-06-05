import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Argus — read the signals",
    template: "%s · Argus",
  },
  description:
    "Prices, news, and indicators in one calm view — with every headline overlaid on the chart. A thinking tool, not a prediction tool.",
  applicationName: "Argus",
  openGraph: {
    title: "Argus — read the signals",
    description:
      "Prices, news, and indicators in one calm view. A thinking tool, not a prediction tool.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

/**
 * Sets the theme class before first paint to avoid a light-mode flash on load
 * for users who prefer (or saved) dark. Mirrors the resolution order in
 * ThemeProvider; that provider then takes over for runtime toggling.
 */
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem("sextant-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;if(t==="dark"){r.classList.add("dark");}r.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
