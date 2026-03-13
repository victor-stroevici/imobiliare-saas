import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ImoFree — Imobiliare fără agenții',
  description: 'Cumpără sau vinde direct, fără comisioane ascunse. Cu protecție juridică reală.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-lg font-bold mb-2">ImoFree</p>
              <p className="text-gray-400 text-sm">Imobiliare directe între particulari. Fără comisioane. Cu protecție juridică.</p>
              <p className="text-gray-500 text-xs mt-4">© 2026 ImoFree. Toate drepturile rezervate.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
