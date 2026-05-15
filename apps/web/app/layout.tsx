import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProviders } from '@/components/theme-providers';
import { AppToaster } from '@/components/app-toaster';

export const metadata: Metadata = {
  title: 'AG-Ágil Gestión',
  description: 'Sistema de gestión empresarial para pequeños negocios en Ecuador',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProviders>
          {children}
          <AppToaster />
        </ThemeProviders>
      </body>
    </html>
  );
}