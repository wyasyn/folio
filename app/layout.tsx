import { Roboto_Mono, Inter, Cantarell } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const cantarellHeading = Cantarell({subsets:['latin'],weight:[ '400', '700'],style:['normal', 'italic'], variable:'--font-heading'});

const roboto = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable, cantarellHeading.variable)}
    >
      <body>
        <ThemeProvider>
        <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
