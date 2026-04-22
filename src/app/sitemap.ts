import type { MetadataRoute } from "next";
import { getDogHotels } from "@/lib/microcms";
import { getAllAreaSlugs } from "@/lib/areaSlugs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://inutabi-biyori.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/business-contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const areaRoutes: MetadataRoute.Sitemap = getAllAreaSlugs().map((slug) => ({
    url: `${SITE_URL}/area/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  try {
    const hotels = await getDogHotels();
    const hotelRoutes: MetadataRoute.Sitemap = hotels.map((hotel) => {
      const lastMod = hotel.updatedAt ? new Date(hotel.updatedAt) : now;
      return {
        url: `${SITE_URL}/hotel/${hotel.id}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });
    return [...staticRoutes, ...areaRoutes, ...hotelRoutes];
  } catch (error) {
    console.error("sitemap hotel fetch failed:", error);
    return [...staticRoutes, ...areaRoutes];
  }
}
