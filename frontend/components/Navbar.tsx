'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ImoFree</span>
            <span className="text-xs text-gray-400 hidden sm:block">fără agenții</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/anunturi"
              className="text-gray-600 hover:text-green-600 text-sm font-medium hidden sm:block"
            >
              Anunțuri
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/adauga-anunt"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  + Adaugă anunț
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium text-xs">
                        {user.prenume[0]}{user.nume[0]}
                      </span>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg border py-1 w-48 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user.prenume} {user.nume}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/contul-meu" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Anunțurile mele
                      </Link>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Deconectare
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-green-600 font-medium">
                  Autentificare
                </Link>
                <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  Înregistrare
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
