import type { Viewport } from "next"
import { Roboto_Mono, Inter, Playfair_Display } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createSiteMetadata, manifestThemeColor } from "@/lib/seo/metadata"

export const metadata = createSiteMetadata()

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: manifestThemeColor },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
  colorScheme: "light dark",
}

const playfairDisplay = Playfair_Display({subsets:['latin'],weight:[ '400', '700'],style:['normal', 'italic'], variable:'--font-heading', display: 'swap'});

const inter = Inter({subsets:['latin'],variable:'--font-sans', display: 'swap'})

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, inter.variable, playfairDisplay.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            {modal}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
