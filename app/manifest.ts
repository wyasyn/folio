import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site-config"
import {
  manifestBackgroundColor,
  manifestThemeColor,
} from "@/lib/seo/metadata"

export default function manifest(): MetadataRoute.Manifest {
  const shortName =
    siteConfig.name.length > 12
      ? `${siteConfig.name.slice(0, 12)}…`
      : siteConfig.name

  return {
    name: `${siteConfig.name} — ${siteConfig.title}`,
    short_name: shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: manifestBackgroundColor,
    theme_color: manifestThemeColor,
    categories: ["portfolio", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
