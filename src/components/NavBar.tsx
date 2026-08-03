"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="shrink-0 text-sm font-medium tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          Journal
        </Link>
        <ul className="hidden items-center gap-1 overflow-x-auto whitespace-nowrap sm:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/dashboard" && pathname === "/") ||
              (link.href === "/calendar" && pathname?.startsWith("/entry"));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-block rounded-full px-3 py-1.5 text-sm transition-all duration-150 ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
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
