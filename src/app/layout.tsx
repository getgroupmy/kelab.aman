import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kelab Aman",
    template: "%s · Kelab Aman",
  },
  description: "Apply for Kelab Aman membership.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-brand-700">
              Kelab Aman
            </Link>
            <nav className="flex gap-4 text-sm text-stone-600">
              <Link href="/apply" className="hover:text-stone-900">
                Apply
              </Link>
              <Link href="/admin" className="hover:text-stone-900">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
