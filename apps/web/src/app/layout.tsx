import "@repo/ui/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@repo/ui/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "proctify",
  description: "Proctor your tests and coding contests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
