import Link from "next/link"
import { CloudinaryImage } from "@/components/ui/cloudinary-image"
import { cn } from "@/lib/utils"

type ContentListCardProps = {
  href: string
  title: string
  description?: string | null
  coverImage?: string | null
  coverBlurDataURL?: string
  meta?: string
  className?: string
}

export function ContentListCard({
  href,
  title,
  description,
  coverImage,
  coverBlurDataURL,
  meta,
  className,
}: ContentListCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full min-h-[22rem] flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-border/70",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 bg-muted">
        {coverImage ? (
          <CloudinaryImage
            src={coverImage}
            alt=""
            preset="cover"
            fill
            blurDataURL={coverBlurDataURL}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" aria-hidden />
        )}
      </div>
      <div className="flex min-h-[8.5rem] flex-1 flex-col gap-2 p-4">
        {meta ? (
          <p className="text-xs text-muted-foreground">{meta}</p>
        ) : (
          <p className="text-xs text-transparent select-none" aria-hidden>
            —
          </p>
        )}
        <h2 className="line-clamp-2 font-sans text-lg font-medium leading-snug tracking-tight">
          {title}
        </h2>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
          {description?.trim() || "\u00a0"}
        </p>
      </div>
    </Link>
  )
}
