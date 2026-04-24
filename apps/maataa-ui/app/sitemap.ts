import type { MetadataRoute } from "next";
import { verifiedScriptsSeed } from "../lib/script-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scripts.vaigyaaniq.info";
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    ...verifiedScriptsSeed
      .filter((script) => script.verificationStatus === "VERIFIED")
      .map((script) => ({ url: `${baseUrl}/scripts/${script.slug}`, lastModified: new Date() })),
    { url: `${baseUrl}/legal/terms`, lastModified: new Date() },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/refund`, lastModified: new Date() },
    { url: `${baseUrl}/legal/license`, lastModified: new Date() }
  ];
}
