import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "R-Pilot",
  description: "Your local R code interpreter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            color-scheme: light;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              color-scheme: dark;
            }
          }
          
          /* Prevent theme flash */
          html {
            visibility: visible;
            opacity: 1;
          }
        `}</style>
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider>
          <main className="h-screen bg-background text-foreground">
            {children}
          </main>
          <Toaster richColors closeButton theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
