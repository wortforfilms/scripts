export type PublicNavItem = {
  key: "home" | "scripts" | "products" | "courses" | "tools" | "timeline" | "about";
  href: string;
};

export const publicNavItems: PublicNavItem[] = [
  { key: "home", href: "/" },
  { key: "scripts", href: "/scripts" },
  { key: "products", href: "/products" },
  { key: "courses", href: "/courses" },
  { key: "tools", href: "/tools" },
  { key: "timeline", href: "/timeline" },
  { key: "about", href: "/about" }
];
