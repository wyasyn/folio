import { Roboto_Mono, Inter, Playfair_Display } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

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
