import type { MetadataRoute } from "next";
import { APPLY_OPEN, APPLY_URL, CANONICAL_URL, CONTENT_UPDATED_ISO, OG_IMAGE_URL } from "./event";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_UPDATED_ISO);
  return [
    {
      url: CANONICAL_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [OG_IMAGE_URL],
    },
    { url: APPLY_URL, lastModified, changeFrequency: "weekly", priority: 0.8 },
    // Con las inscripciones cerradas, /equipo y /solo redirigen a /inscripcion:
    // no se listan.
    ...(APPLY_OPEN
      ? (["equipo", "solo"] as const).map((p) => ({
          url: `${APPLY_URL}/${p}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
      : []),
  ];
}
