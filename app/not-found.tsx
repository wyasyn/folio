import { images } from "@/constants/images"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
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
            <p className="text-sm font-medium text-primary">404</p>
            <h1 className="text-3xl font-semibold text-foreground">Page not found</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              The route you requested does not exist or may have been moved.
            </p>
            
              <Button asChild className="w-full">
                <Link href="/">Go home</Link>
              </Button>
             
            
          </section>
        </div>
      </div>
    </main>
  )
}
