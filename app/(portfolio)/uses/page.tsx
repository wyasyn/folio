import Link from "next/link"
import { usesCategories } from "@/lib/uses-data"
import { createPageMetadata } from "@/lib/seo/metadata"

export const revalidate = 3600

export const metadata = createPageMetadata({
  title: "Uses",
  description: "Software, hardware, and workflows I reach for regularly.",
  path: "/uses",
})

export default function UsesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:py-24">
      <header className="mb-10 max-w-3xl space-y-2 text-left">
        <h1 className="text-3xl md:text-7xl italic tracking-tight">Uses</h1>
        <p className="text-muted-foreground">
          Software, hardware, and workflows I reach for regularly.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10">
        {usesCategories.map((category) => (
          <section key={category.title} className="space-y-4 text-left">
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {category.items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-1 px-4 py-3 text-left"
                >
                  <span className="font-medium">
                    {item.href ? (
                      <Link
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </span>
                  {item.description ? (
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
