"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/search", label: "Search" },
  { href: "/entries", label: "All entries" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/today" className="shrink-0 text-sm font-medium tracking-tight text-foreground">
          Journal
        </Link>
        <ul className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/today" && pathname === "/") ||
              (link.href === "/entries" && pathname?.startsWith("/entry"));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-foreground/60 hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
