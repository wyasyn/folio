import Link from "next/link"
import {
  IconArticle,
  IconArrowUpRight,
  IconFolderPlus,
  IconSettings,
  type TablerIcon,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions: {
  label: string
  href: string
  icon: TablerIcon
}[] = [
  { label: "New blog post", href: "/dashboard/posts/new", icon: IconArticle },
  { label: "Add project", href: "/dashboard/projects/new", icon: IconFolderPlus },
  { label: "Update profile", href: "/dashboard/settings", icon: IconSettings },
]

export function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Common tasks from the overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.href}
              variant="outline"
              className="h-11 w-full justify-between px-3"
              asChild
            >
              <Link href={action.href}>
                <span className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 opacity-80" />
                  {action.label}
                </span>
                <IconArrowUpRight className="size-4 shrink-0 opacity-60" />
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
