import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Add Bitcoin Location | BTC Map",
  description: "Quickly add Bitcoin-accepting merchants to the map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-muted-foreground bg-gradient-to-t from-background via-background to-transparent">
          <p>
            Made with ♥ by{" "}
            <a
              href="https://twitter.com/sahilc0"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Sahil
            </a>
          </p>
          <p className="mt-0.5">
            Thanks to{" "}
            <a
              href="https://btcmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              BTCMap
            </a>{" "}
            contributors
          </p>
        </footer>
      </body>
    </html>
  );
}
