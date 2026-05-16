import type { Metadata } from "next"
import Image from "next/image"
import { images } from "@/constants/images"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className='h-screen p-3'>
       
        <div className="grid h-full lg:grid-cols-2">
            <div className="relative hidden h-full rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 lg:block">
                <Image
                  src={images.authBackground.src}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt="Auth Background"
                  className="object-cover"
                />
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/50 rounded-2xl" />

            </div>
            <div className="flex items-center justify-center p-6 md:p-10">
                {children}
            </div>
        </div>  
    </main>
  )
}
