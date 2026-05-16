import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CountryRow, ReferrerRow } from "@/lib/dashboard/analytics-data"

type ReferrerCountryListsProps = {
  referrers: ReferrerRow[]
  countries: CountryRow[]
}

function SimpleList({
  title,
  description,
  items,
  labelKey,
  valueKey,
}: {
  title: string
  description: string
  items: Record<string, string | number>[]
  labelKey: string
  valueKey: string
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={String(item[labelKey])}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate">{String(item[labelKey])}</span>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {Number(item[valueKey]).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function ReferrerCountryLists({
  referrers,
  countries,
}: ReferrerCountryListsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SimpleList
        title="Top referrers"
        description="Last 30 days · external only"
        items={referrers as unknown as Record<string, string | number>[]}
        labelKey="referrer"
        valueKey="views"
      />
      <SimpleList
        title="Top countries"
        description="Last 30 days · from CDN headers"
        items={countries as unknown as Record<string, string | number>[]}
        labelKey="country"
        valueKey="views"
      />
    </div>
  )
}
