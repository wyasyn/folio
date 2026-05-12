import { getDashboardSectionById } from "@/lib/dashboard-navigation"
import db from "@/lib/db"
import { getDashboardSession, isAdmin } from "@/lib/authz"

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function BarRow({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function profileCompletion(user: {
  name: string | null
  jobTitle: string | null
  tagline: string | null
  bio: string | null
  location: string | null
  image: string | null
  website: string | null
  github: string | null
  linkedin: string | null
  publicEmail: string | null
  resumeUrl: string | null
}) {
  const fields = [
    user.name,
    user.jobTitle,
    user.tagline,
    user.bio,
    user.location,
    user.image,
    user.website,
    user.github,
    user.linkedin,
    user.publicEmail,
    user.resumeUrl,
  ]
  const complete = fields.filter(
    (field) => field && field.trim().length > 0
  ).length
  return Math.round((complete / fields.length) * 100)
}

export default async function Page() {
  const session = await getDashboardSession()
  const overviewSection = getDashboardSectionById("overview")
  const admin = isAdmin(session.user)
  const scope = admin ? {} : { userId: session.user.id }
  const authorScope = admin ? {} : { authorId: session.user.id }

  const [
    user,
    totalUsers,
    bannedUsers,
    projectsPublished,
    projectsDraft,
    postsPublished,
    postsDraft,
    newsPublished,
    newsDraft,
    featuredProjects,
    featuredPosts,
    featuredNews,
    tags,
    techStacks,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        jobTitle: true,
        tagline: true,
        bio: true,
        location: true,
        image: true,
        website: true,
        github: true,
        linkedin: true,
        publicEmail: true,
        resumeUrl: true,
      },
    }),
    admin ? db.user.count() : Promise.resolve(0),
    admin ? db.user.count({ where: { banned: true } }) : Promise.resolve(0),
    db.project.count({ where: { ...scope, published: true } }),
    db.project.count({ where: { ...scope, published: false } }),
    db.post.count({ where: { ...authorScope, published: true } }),
    db.post.count({ where: { ...authorScope, published: false } }),
    db.news.count({ where: { ...authorScope, published: true } }),
    db.news.count({ where: { ...authorScope, published: false } }),
    db.project.count({ where: { ...scope, featured: true } }),
    db.post.count({ where: { ...authorScope, featured: true } }),
    db.news.count({ where: { ...authorScope, featured: true } }),
    db.tag.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { name: true, _count: { select: { Post: true, News: true } } },
    }),
    db.techStack.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { name: true, _count: { select: { Project: true } } },
    }),
  ])

  const completion = user ? profileCompletion(user) : 0
  const contentMax = Math.max(
    projectsPublished + projectsDraft,
    postsPublished + postsDraft,
    newsPublished + newsDraft
  )
  const featuredTotal = featuredProjects + featuredPosts + featuredNews

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {overviewSection.label}
        </h1>
        <p className="text-sm text-muted-foreground">
          {admin
            ? "Global publishing, user, and taxonomy activity across the dashboard."
            : "Manage your portfolio at a glance: projects, writing, news, and profile completion."}
        </p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          label={admin ? "Users" : "Published Projects"}
          value={admin ? totalUsers : projectsPublished}
          detail={admin ? `${bannedUsers} blocked` : `${projectsDraft} drafts`}
        />
        <StatCard
          label="Published Posts"
          value={postsPublished}
          detail={`${postsDraft} drafts`}
        />
        <StatCard
          label={admin ? "Featured Content" : "Profile Completion"}
          value={admin ? featuredTotal : `${completion}%`}
          detail={
            admin
              ? "Across projects, posts, and news"
              : "Based on settings fields"
          }
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground">Content Mix</h2>
          <div className="mt-5 space-y-4">
            <BarRow
              label="Projects"
              value={projectsPublished + projectsDraft}
              max={contentMax}
            />
            <BarRow
              label="Posts"
              value={postsPublished + postsDraft}
              max={contentMax}
            />
            <BarRow
              label="News"
              value={newsPublished + newsDraft}
              max={contentMax}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground">
            Taxonomy Usage
          </h2>
          <div className="mt-5 space-y-4">
            {tags.map((tag) => (
              <BarRow
                key={tag.name}
                label={tag.name}
                value={tag._count.Post + tag._count.News}
                max={Math.max(
                  ...tags.map((t) => t._count.Post + t._count.News),
                  1
                )}
              />
            ))}
            {admin &&
              techStacks.map((stack) => (
                <BarRow
                  key={stack.name}
                  label={stack.name}
                  value={stack._count.Project}
                  max={Math.max(...techStacks.map((t) => t._count.Project), 1)}
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
