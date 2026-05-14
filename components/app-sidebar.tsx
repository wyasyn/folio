"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  IconArticle,
  IconCamera,
  IconDotsVertical,
  IconFolder,
  IconHexagon,
  IconLayoutDashboard,
  IconLogout,
  IconNews,
  IconSettings,
  IconTags,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"
import {
  dashboardSections,
  getDashboardSectionByPath,
  type DashboardSectionId,
} from "@/lib/dashboard-navigation"
import Image from "next/image"

const sectionIcons: Record<DashboardSectionId, TablerIcon> = {
  overview: IconLayoutDashboard,
  projects: IconFolder,
  posts: IconArticle,
  news: IconNews,
  tags: IconTags,
  "tech-stacks": IconHexagon,
  screenshots: IconCamera,
  users: IconUsers,
  settings: IconSettings,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const activeSection = getDashboardSectionByPath(pathname)
  const { data: session } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const userName = session?.user?.name?.trim() || "User"
  const userEmail = session?.user?.email || "user@example.com"
  const avatarText = userName.slice(0, 1).toUpperCase()
  const userImage =
    session?.user?.image ||
    "https://res.cloudinary.com/dkdteb9m5/image/upload/v1773650944/Frame_1_ucq2oa.png"
  const isAdmin =
    typeof session?.user?.role === "string" &&
    session.user.role.split(",").includes("admin")
  const visibleSections = dashboardSections.filter(
    (section) => !section.adminOnly || isAdmin
  )

  return (
    <Sidebar variant="floating" {...props}>
      
     
      <SidebarContent className=" mt-16">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {visibleSections.map((item) => {
              const ItemIcon = sectionIcons[item.id]
              const isActive = activeSection.id === item.id

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Link
                      href={item.href}
                      className="font-medium text-muted-foreground"
                    >
                      <ItemIcon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="relative" ref={userMenuRef}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border bg-sidebar-accent text-xs font-semibold">
                  {session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={userName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{avatarText}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {userEmail}
                  </span>
                </div>
                <IconDotsVertical />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {isUserMenuOpen ? (
            <div className="absolute right-0 bottom-12 z-50 w-52 rounded-lg border bg-popover p-1 shadow-sm">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <IconSettings className="size-4" />
                More settings
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={async () => {
                  setIsUserMenuOpen(false)
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/login"
                      },
                    },
                  })
                }}
              >
                <IconLogout className="size-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
