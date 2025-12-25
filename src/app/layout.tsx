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
        <footer className="py-6 text-center text-xs text-muted-foreground/60">
          <p>
            Made by{" "}
            <a
              href="https://twitter.com/sahilc0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Sahil
            </a>
            {" · "}
            Powered by{" "}
            <a
              href="https://btcmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              BTCMap
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
