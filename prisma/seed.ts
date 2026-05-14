/**
 * Seeds portfolio projects for a single user.
 *
 * User resolution (first match wins):
 * 1. `SEED_PROJECTS_USER_ID` — must exist in `user.id` (e.g. your Better Auth id).
 * 2. Otherwise the first user ordered by `createdAt` ascending.
 *
 * Idempotent for these slugs: existing rows with the same `slug` and resolved
 * `userId` are deleted, then recreated (tech stacks are connect-or-created).
 *
 * Run: `pnpm db:seed` (requires `DATABASE_URL` in `.env`).
 */

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../generated/prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter: new PrismaPg(pool) })

type SeedProjectInput = {
  slug: string
  title: string
  coverImage: string | null
  liveUrl: string | null
  githubUrl: string | null
  featured: boolean
  description: string
  markdown: string
  published: boolean
  techStackNames: string[]
  screenshotUrls: string[]
}

type SeedContentInput = {
  slug: string
  title: string
  coverImage: string | null
  featured: boolean
  description: string
  markdown: string
  published: boolean
  readTime: number
  tagNames: string[]
}

const projects: SeedProjectInput[] = [
  {
    slug: "aurora-skin-analyzer",
    title: "Aurora Skin Analyzer",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    liveUrl: "https://aurora-skin-analyzer.vercel.app",
    githubUrl: "https://github.com/yasindotdev/aurora-skin-analyzer",
    featured: true,
    description:
      "AI-powered skin condition detection platform using deep learning and IoT integration.",
    markdown: `
# Aurora Skin Analyzer

Aurora Skin Analyzer is an AI-powered healthcare platform designed to detect common skin conditions from uploaded images.

## Features
- AI-based skin disease prediction
- Image upload and real-time analysis
- Confidence score visualization
- Patient history tracking
- Admin dashboard
- IoT skin sensor integration

## Technologies
- Next.js
- FastAPI
- TensorFlow
- PostgreSQL
- Tailwind CSS
    `,
    published: true,
    techStackNames: [
      "Next.js",
      "FastAPI",
      "TensorFlow",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    screenshotUrls: [
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514",
    ],
  },

  {
    slug: "smart-attendance-system",
    title: "Smart Attendance System",
    coverImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    liveUrl: "https://attendance-ai.vercel.app",
    githubUrl: "https://github.com/yasindotdev/smart-attendance-system",
    featured: true,
    description:
      "Face recognition attendance management system for schools and organizations.",
    markdown: `
# Smart Attendance System

A modern attendance management system that uses facial recognition to automate attendance tracking.

## Features
- Face recognition login
- Daily attendance reports
- Excel export
- Student performance tracking
- Admin management dashboard

## Technologies
- Next.js
- OpenCV
- Python
- Prisma
- MySQL
    `,
    published: true,
    techStackNames: ["Next.js", "OpenCV", "Prisma", "MySQL", "Python"],
    screenshotUrls: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    ],
  },

  {
    slug: "plant-disease-detector",
    title: "Plant Disease Detector",
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
    liveUrl: "https://plant-health-ai.vercel.app",
    githubUrl: "https://github.com/yasindotdev/plant-disease-detector",
    featured: false,
    description:
      "Mobile-first AI app for detecting plant diseases from leaf images.",
    markdown: `
# Plant Disease Detector

An AI-powered agricultural assistant that helps farmers identify crop diseases using smartphone cameras.

## Features
- Leaf image scanning
- Disease prediction
- Treatment recommendations
- Offline history caching
- Multi-language support

## Technologies
- React Native
- Expo
- FastAPI
- Zustand
- TensorFlow Lite
    `,
    published: true,
    techStackNames: [
      "React Native",
      "Expo",
      "FastAPI",
      "TensorFlow Lite",
      "Zustand",
    ],
    screenshotUrls: [
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    ],
  },

  {
    slug: "financial-planning-assistant",
    title: "AI Financial Planning Assistant",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    liveUrl: "https://finance-ai.vercel.app",
    githubUrl: "https://github.com/yasindotdev/financial-planning-assistant",
    featured: true,
    description:
      "Machine learning platform for generating personalized financial recommendations.",
    markdown: `
# AI Financial Planning Assistant

A smart financial assistant that analyzes spending habits and provides personalized budgeting advice.

## Features
- Expense analytics
- Budget recommendations
- Savings forecasting
- AI-generated insights
- Interactive dashboard

## Technologies
- Remix
- Node.js
- MongoDB
- Chart.js
- OpenAI API
    `,
    published: true,
    techStackNames: ["Remix", "Node.js", "MongoDB", "Chart.js", "OpenAI API"],
    screenshotUrls: [
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
    ],
  },

  {
    slug: "eco-home-creations",
    title: "Eco Home Creations Website",
    coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    liveUrl: "https://eco-home-creations.vercel.app",
    githubUrl: "https://github.com/yasindotdev/eco-home-creations",
    featured: false,
    description:
      "Corporate website for a sustainable furniture and décor company.",
    markdown: `
# Eco Home Creations

A modern company website showcasing eco-friendly furniture and décor products made from recycled materials.

## Features
- Product showcase
- Company profile
- Contact forms
- Responsive design
- SEO optimization

## Technologies
- Next.js
- Tailwind CSS
- Prisma
- PostgreSQL
- Cloudinary
    `,
    published: true,
    techStackNames: [
      "Next.js",
      "Tailwind CSS",
      "Prisma",
      "PostgreSQL",
      "Cloudinary",
    ],
    screenshotUrls: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],
  },
]

const posts: SeedContentInput[] = [
  {
    slug: "building-dashboard-cms-nextjs-prisma",
    title: "Building a Dashboard CMS with Next.js and Prisma",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    featured: true,
    description:
      "A practical walkthrough of structuring CRUD dashboards with App Router and Prisma.",
    markdown: `
# Building a Dashboard CMS

This article covers the patterns behind a clean content dashboard: server-side pagination, reusable forms, explicit API payload parsing, and safe ownership checks.

## Highlights
- Route handlers for mutations
- Server components for listing data
- Shared validation helpers
- Role-aware admin views
    `,
    published: true,
    readTime: 6,
    tagNames: ["Engineering", "Next.js", "Prisma"],
  },
  {
    slug: "designing-content-workflows-for-portfolios",
    title: "Designing Content Workflows for Portfolio Sites",
    coverImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    featured: false,
    description:
      "How to keep projects, posts, and announcements manageable as a portfolio grows.",
    markdown: `
# Designing Content Workflows

Portfolio dashboards need more than forms. They need predictable drafts, taxonomy hygiene, and admin workflows that stay simple.

## Workflow checklist
- Draft before publishing
- Tag content consistently
- Keep featured content intentional
- Review stale entries regularly
    `,
    published: true,
    readTime: 4,
    tagNames: ["Product", "Design", "Portfolio"],
  },
]

const newsItems: SeedContentInput[] = [
  {
    slug: "dashboard-cms-launch",
    title: "Dashboard CMS Launch",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    featured: true,
    description:
      "The dashboard now manages projects, posts, news, tags, tech stacks, and users.",
    markdown: `
# Dashboard CMS Launch

The portfolio dashboard now includes complete content management tools for projects, posts, news, and admin-only catalogs.
    `,
    published: true,
    readTime: 2,
    tagNames: ["Launch", "Product"],
  },
  {
    slug: "admin-user-management-added",
    title: "Admin User Management Added",
    coverImage: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
    featured: false,
    description:
      "Admins can now review users, update roles, block access, and delete accounts.",
    markdown: `
# Admin User Management Added

The admin dashboard includes user search, role management, blocking, and deletion workflows using Better Auth admin support.
    `,
    published: true,
    readTime: 2,
    tagNames: ["Admin", "Security"],
  },
]

async function resolveUserId(): Promise<string> {
  const fromEnv = process.env.SEED_PROJECTS_USER_ID?.trim()
  if (fromEnv) {
    const user = await db.user.findUnique({ where: { id: fromEnv } })
    if (!user) {
      throw new Error(
        `SEED_PROJECTS_USER_ID=${fromEnv} does not match any user. Create an account first or fix the id.`
      )
    }
    return user.id
  }

  const first = await db.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })
  if (!first) {
    throw new Error(
      "No users in the database. Sign up once, then run the seed again, or set SEED_PROJECTS_USER_ID."
    )
  }
  return first.id
}

async function main() {
  const userId = await resolveUserId()
  const slugs = projects.map((p) => p.slug)
  const postSlugs = posts.map((p) => p.slug)
  const newsSlugs = newsItems.map((n) => n.slug)

  await db.project.deleteMany({
    where: { userId, slug: { in: slugs } },
  })
  await db.post.deleteMany({
    where: { authorId: userId, slug: { in: postSlugs } },
  })
  await db.news.deleteMany({
    where: { authorId: userId, slug: { in: newsSlugs } },
  })

  for (const p of projects) {
    const content = p.markdown.trim()

    await db.project.create({
      data: {
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        featured: p.featured,
        description: p.description,
        content,
        published: p.published,
        userId,
        updatedAt: new Date(),
        TechStack: {
          connectOrCreate: p.techStackNames.map((name) => ({
            where: { name },
            create: { name, updatedAt: new Date() },
          })),
        },
        screenshots: {
          create: p.screenshotUrls.map((url) => ({ url })),
        },
      },
    })
  }

  for (const p of posts) {
    const content = p.markdown.trim()

    await db.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage,
        featured: p.featured,
        description: p.description,
        content,
        published: p.published,
        readTime: p.readTime,
        authorId: userId,
        updatedAt: new Date(),
        Tag: {
          connectOrCreate: p.tagNames.map((name) => ({
            where: { name },
            create: { name, updatedAt: new Date() },
          })),
        },
      },
    })
  }

  for (const n of newsItems) {
    const content = n.markdown.trim()

    await db.news.create({
      data: {
        slug: n.slug,
        title: n.title,
        coverImage: n.coverImage,
        featured: n.featured,
        description: n.description,
        content,
        published: n.published,
        readTime: n.readTime,
        authorId: userId,
        updatedAt: new Date(),
        tags: {
          connectOrCreate: n.tagNames.map((name) => ({
            where: { name },
            create: { name, updatedAt: new Date() },
          })),
        },
      },
    })
  }

  console.log(
    `Seeded ${projects.length} projects, ${posts.length} posts, and ${newsItems.length} news items for user ${userId}.`
  )
}

main()
  .then(async () => {
    await db.$disconnect()
    await pool.end()
  })
  .catch(async (error) => {
    console.error(error)
    await db.$disconnect()
    await pool.end()
    process.exit(1)
  })
