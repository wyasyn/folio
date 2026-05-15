export type AdviseTopicId =
  | "site"
  | "projects"
  | "blog"
  | "blog-ideas"
  | "news"
  | "site-management"

export type AdviseTopic = {
  id: AdviseTopicId
  label: string
  description: string
  prompt: string
}

export const ADVISE_TOPICS: AdviseTopic[] = [
  {
    id: "site",
    label: "Site overview",
    description: "Positioning, gaps, and quick wins for the portfolio.",
    prompt: `Review the entire portfolio site (profile, projects, blog, news). Provide:
- A short assessment of positioning and consistency
- 3–5 highest-impact improvements
- Anything missing that visitors typically expect`,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Which to feature, finish, or rewrite.",
    prompt: `Focus on projects. Provide:
- Which projects to feature or deprioritize and why
- Drafts that should be published or merged
- Suggestions to strengthen descriptions and case-study structure`,
  },
  {
    id: "blog",
    label: "Blog",
    description: "Improve existing posts and editorial rhythm.",
    prompt: `Focus on the blog. Provide:
- Themes already covered vs gaps
- Concrete edits for weak posts (titles, intros, structure)
- A realistic publishing cadence recommendation`,
  },
  {
    id: "blog-ideas",
    label: "Blog ideas",
    description: "New post ideas aligned with your work.",
    prompt: `Suggest 8–12 blog post ideas tailored to this portfolio. For each include: working title, one-line angle, target audience, and which existing project or skill it ties to. Prioritize ideas that reinforce hireability.`,
  },
  {
    id: "news",
    label: "News",
    description: "Updates and announcements strategy.",
    prompt: `Focus on news/announcements. Provide:
- What belongs in news vs blog
- Ideas for the next 3–5 news items
- How to keep news useful without noise`,
  },
  {
    id: "site-management",
    label: "Site management",
    description: "Tags, stacks, profile, and maintenance checklist.",
    prompt: `Provide a practical site management brief:
- Profile and SEO checklist
- Tag and tech-stack hygiene
- Content backlog priorities for the next 2 weeks
- Metrics or habits to track (lightweight, no vanity)`,
  },
]

export function getAdviseTopic(id: string): AdviseTopic | undefined {
  return ADVISE_TOPICS.find((t) => t.id === id)
}
