import "@repo/ui/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@repo/ui/components/ui/toaster";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

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
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <main>
            {children}
            <Toaster />
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
