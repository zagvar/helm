import Link from "next/link";
import { MarkGithubIcon } from "@primer/octicons-react";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/demo", label: "Demo" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <span className="truncate hidden sm:block text-sm font-semibold text-foreground">
              Helm
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button asChild key={item.href} size="sm" variant="ghost">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitch />
          <Button asChild size="icon" variant="outline">
            <a
              aria-label="Open Helm on GitHub"
              href="https://github.com/zagvar/helm"
              rel="noreferrer"
              target="_blank"
            >
              <MarkGithubIcon aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
