"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/today", label: "Today", icon: "✍️" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden print:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-around">
        {LINKS.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/dashboard" && pathname === "/") ||
            (link.href === "/calendar" && pathname?.startsWith("/entry"));
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-150 ${
                  active ? "text-accent" : "text-foreground-muted"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
