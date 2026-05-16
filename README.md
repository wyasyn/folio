# Folio

Personal portfolio and admin dashboard built with **Next.js** (App Router), **Prisma**, **PostgreSQL**, and **Better Auth**. Public site, authenticated dashboard for projects and settings, and media uploads via Cloudinary.

## Stack

- [Next.js](https://nextjs.org/) 16 · [React](https://react.dev/) 19 · [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) ORM · PostgreSQL ([`pg`](https://node-postgres.com/))
- [Better Auth](https://www.better-auth.com/) (email/password + Google & GitHub OAuth)
- [Cloudinary](https://cloudinary.com/) for image uploads
- [shadcn/ui](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/) v4 · [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- Split-pane Markdown editor ([CodeMirror 6](https://codemirror.net/), [react-markdown](https://github.com/remarkjs/react-markdown), KaTeX, GFM) for projects, posts, and news

## Features

- Public portfolio route group and marketing-style layout
- Sign up / sign in with OAuth providers
- Dashboard: overview, analytics (page views, referrers, countries), projects (create with Markdown content and tech stack), posts/news, profile settings
- First-party page view tracking on the public portfolio plus optional PostHog for deeper analytics
- API routes for auth, projects, profile, and signed Cloudinary uploads

## Prerequisites

- **Node.js** 20+ (recommended)
- **pnpm** 9+ (this repo uses `pnpm-lock.yaml`)
- **PostgreSQL** database
- **Cloudinary** account (for uploads)
- **Google** and/or **GitHub** OAuth apps if you use those providers

## Getting started

1. **Clone and install**

   ```bash
   git clone <your-repo-url> folio
   cd folio
   pnpm install
   ```

2. **Environment**

   Copy the example file and fill in real values:

   ```bash
   cp .env.example .env
   ```

   See [Environment variables](#environment-variables) below.

3. **Database**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

   For a quick local schema sync without migrations, you can use `pnpm db:push` instead of migrate (not recommended for production).

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Ensure `BETTER_AUTH_URL` matches the URL you use (including port).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `BETTER_AUTH_SECRET` | Session signing secret (use a long random string, 32+ characters) |
| `BETTER_AUTH_URL` | App base URL (e.g. `http://localhost:3000` in dev, your production URL when deployed) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials |
| `ANALYTICS_ENABLED` | Set to `false` to disable first-party page view ingest (default: enabled) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Optional PostHog project key and ingest host |
| `UPTIME_API_KEY` / `UPTIME_MONITOR_ID` | Optional UptimeRobot credentials for the dashboard uptime card |

### Analytics setup

1. **First-party views** — Enabled by default on public routes. Events are stored in PostgreSQL (`PageView`) and shown on **Dashboard → Overview** and **Dashboard → Analytics**.
2. **PostHog** (optional) — Create a project at [posthog.com](https://posthog.com), add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env`, and redeploy.
3. **Uptime** — Create a monitor at [UptimeRobot](https://uptimerobot.com) pointing at `https://your-domain.com/api/health`. Add `UPTIME_API_KEY` and `UPTIME_MONITOR_ID` to show status on the overview dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting |
| `pnpm format` | Format with Prettier |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Create/apply migrations (local dev) |
| `pnpm db:deploy` | Apply migrations (CI/production) |
| `pnpm db:push` | Push schema to DB (prototyping) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Reset database and re-run migrations |

## UI components (shadcn)

Add or update components with the shadcn CLI, for example:

```bash
pnpm dlx shadcn@latest add button
```

Import from `@/components/ui/...` as in the [shadcn docs](https://ui.shadcn.com/docs).
