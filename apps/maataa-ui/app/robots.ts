import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scripts.vaigyaaniq.info";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/checkout/", "/api/", "/products/"] }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
