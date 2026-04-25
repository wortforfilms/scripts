import Link from "next/link";

export const metadata = {
  title: "Products | Maataa Scripts",
  description: "Marketplace product areas staged for verified scripts, books, datasets, fonts, and tools."
};

export default function ProductsPage() {
  const sections = [
    { title: "Books", href: "/creators" },
    { title: "Courses", href: "/creators" },
    { title: "Fonts", href: "/creators" },
    { title: "Tools", href: "/creators" },
    { title: "Datasets", href: "/sponsors" },
    { title: "Media", href: "/sponsors" },
    { title: "Research Packs", href: "/creators" },
    { title: "Digital Licenses", href: "/checkout" }
  ];
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Products</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Product areas are active for preview, but paid publishing remains gated by approval, license, and verified checkout.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.title} href={section.href} className="rounded border border-white/10 bg-white/5 p-5 hover:border-amber-300/60">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Connected to creator, sponsor, approval, checkout, and access-control flows.</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
