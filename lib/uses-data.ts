export type UsesItem = {
  name: string
  description?: string
  href?: string
}

export type UsesCategory = {
  title: string
  items: UsesItem[]
}

export const usesCategories: UsesCategory[] = [
  {
    title: "Development",
    items: [
      { name: "Editor", description: "Cursor / VS Code" },
      { name: "Terminal", description: "Ghostty + zsh" },
      { name: "Runtime", description: "Node.js, pnpm" },
      { name: "Framework", description: "Next.js (App Router)", href: "https://nextjs.org" },
      { name: "Styling", description: "Tailwind CSS" },
      { name: "Database", description: "PostgreSQL + Prisma" },
    ],
  },
  {
    title: "Hardware",
    items: [
      { name: "Machine", description: "Linux workstation" },
      { name: "Display", description: "27\" 1440p" },
      { name: "Input", description: "Mechanical keyboard, trackball mouse" },
      { name: "Audio", description: "Closed-back headphones for focus" },
    ],
  },
  {
    title: "Productivity",
    items: [
      { name: "Notes", description: "Markdown in-repo docs" },
      { name: "Design", description: "Figma for layout references" },
      { name: "Email", description: "Resend for transactional mail" },
      { name: "Media", description: "Cloudinary for image delivery" },
    ],
  },
]
