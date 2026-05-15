import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { RecentPost } from "@/lib/dashboard/overview-data"

type RecentPostsCardProps = {
  posts: RecentPost[]
}

export function RecentPostsCard({ posts }: RecentPostsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent posts</CardTitle>
        <CardDescription>Latest updates across your blog</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <ul className="space-y-0">
            {posts.map((post, index) => (
              <li key={`${post.title}-${index}`}>
                {index > 0 ? <Separator className="my-3" /> : null}
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">
                    {post.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {post.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
