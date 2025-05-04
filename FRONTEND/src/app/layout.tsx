import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Form Builder',
  description: 'Create and manage forms with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 flex items-center justify-center py-6">
                <div className="container">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
