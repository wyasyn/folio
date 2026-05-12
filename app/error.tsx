"use client"

import { useEffect } from "react"
import { images } from "@/constants/images"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="h-screen p-3">
      <div className="grid h-full lg:grid-cols-2">
        <div className="relative hidden h-full overflow-hidden rounded-2xl lg:block">
          <Image
            src={images.errorAuthVisual.src}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Decorative background for error pages"
            className="object-cover"
          />
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/10 to-primary/50" />
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <section className="w-full max-w-md space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-primary">Something went wrong</p>
            <h1 className="text-3xl font-semibold text-foreground">Unexpected error</h1>
            <p className="text-sm text-muted-foreground">
              We hit an issue while loading this page. You can try again or return home.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
