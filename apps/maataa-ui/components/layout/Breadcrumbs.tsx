"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbsProps = {
  pathname: string;
  publicPath: boolean;
};

const labelOverrides: Record<string, string> = {
  admin: "Admin",
  api: "API",
  cart: "Cart",
  checkout: "Checkout",
  dashboard: "Dashboard",
  legal: "Legal",
  license: "License",
  privacy: "Privacy",
  products: "Products",
  refund: "Refund",
  scripts: "Scripts",
  signin: "Sign In",
  signup: "Sign Up",
  terms: "Terms",
  timeline: "Timeline",
  upgrade: "Upgrade"
};

function segmentLabel(segment: string) {
  return labelOverrides[segment] ?? segment.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Breadcrumbs({ pathname, publicPath }: BreadcrumbsProps) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const textColor = publicPath ? "text-white/70" : "text-white/60";
  const borderColor = publicPath ? "border-white/10 bg-[#061018]/85" : "border-white/10 bg-black/20";

  return (
    <nav aria-label="Breadcrumb" className={`border-b ${borderColor}`}>
      <ol className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-2 text-sm">
        <li>
          <Link href="/" className={`inline-flex items-center gap-1 rounded px-1.5 py-1 ${textColor} hover:text-amber-300`}>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const current = index === segments.length - 1;
          return (
            <li key={href} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30" aria-hidden="true" />
              {current ? (
                <span aria-current="page" className="whitespace-nowrap rounded px-1.5 py-1 font-medium text-white">
                  {segmentLabel(segment)}
                </span>
              ) : (
                <Link href={href} className={`whitespace-nowrap rounded px-1.5 py-1 ${textColor} hover:text-amber-300`}>
                  {segmentLabel(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
