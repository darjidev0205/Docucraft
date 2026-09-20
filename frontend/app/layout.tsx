import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../stores/auth-context';
import { UIProvider } from '../stores/ui-context';
import { AuthModal } from '../components/auth/AuthModal';
import { ToastContainer } from '../components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'DocuCraft — Document Publishing Studio',
  description:
    'Turn plain text into beautifully formatted, publication-ready vector PDFs with curated architectural templates and rich typographic controls.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-paper-warm text-ink-900 font-sans selection:bg-brand-cream selection:text-ink-900">
        <AuthProvider>
          <UIProvider>
            {children}
            <AuthModal />
            <ToastContainer />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
