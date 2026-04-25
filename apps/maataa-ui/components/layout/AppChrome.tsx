"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { SettingsFab } from "./SettingsFab";
import { GlobalJoyride } from "../joyride/GlobalJoyride";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import { publicNavItems } from "../../lib/navigation/public-navigation";

type AppChromeProps = {
  children: React.ReactNode;
};

const publicPrefixes = ["/about", "/accessibility", "/cart", "/courses", "/creators", "/investors", "/legal", "/partners", "/products", "/scripts", "/signup", "/sponsors", "/tools"];

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/signin" || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const { viewer } = useAuth();
  const { languageOption, t } = useI18n();
  const publicPath = isPublicPath(pathname);

  if (!publicPath) {
    return (
      <div className="min-h-screen md:flex">
        <div data-joyride="app-sidebar">
          <AppSidebar viewer={viewer} />
        </div>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 px-6 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/60">{viewer.isLoggedIn ? `${viewer.role} · ${viewer.plan}` : "Guest"}</span>
              <Link className="text-sm text-white/70" href={viewer.isLoggedIn ? "/dashboard" : "/signin"}>
                {viewer.isLoggedIn ? "Dashboard" : t("signIn")}
              </Link>
            </div>
          </header>
          <Breadcrumbs pathname={pathname} publicPath={false} />
          <div>{children}</div>
        </div>
        <GlobalJoyride />
        <SettingsFab />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061018] text-white">
      <header data-joyride="public-nav" className="sticky top-0 z-30 border-b border-white/10 bg-[#061018]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img src="/landing/logo-mark.png" alt="" className="h-12 w-12 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-xl font-semibold leading-tight md:text-2xl">scripts.vaigyaaniq.info</span>
              <span className="hidden text-xs text-white/65 sm:block">Scripts. Languages. Knowledge. Civilization.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-white/85 lg:flex">
            {publicNavItems.map((item) => (
              <Link key={item.href} className={pathname === item.href ? "text-amber-300" : undefined} href={item.href}>
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div data-joyride="search" className="ml-auto hidden min-w-56 max-w-72 flex-1 items-center gap-2 rounded border border-white/20 bg-black/20 px-3 py-2 text-sm text-white/50 xl:flex">
            <span className="truncate">Search scripts, books, courses...</span>
            <Search className="ml-auto h-4 w-4 text-white/80" aria-hidden="true" />
          </div>
          <span className="hidden rounded border border-white/10 px-2 py-1 text-xs text-white/55 sm:inline-flex">
            {languageOption.nativeLabel}
          </span>
          <Link data-joyride="cart" href="/cart" className="relative rounded p-2 text-white/80" aria-label={t("cart")}>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-amber-300 px-1 text-[10px] font-semibold text-black">0</span>
          </Link>
          <Link data-joyride="signup" href="/signup" className="rounded border border-amber-300 px-4 py-2 text-sm font-semibold text-white">
            {t("signUp")}
          </Link>
        </div>
      </header>
      <Breadcrumbs pathname={pathname} publicPath />
      {children}
      <GlobalJoyride />
      <SettingsFab />
    </div>
  );
}
