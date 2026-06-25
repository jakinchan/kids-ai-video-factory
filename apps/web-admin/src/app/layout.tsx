import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kids AI Video Factory",
  description: "Claw Director agent console"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
