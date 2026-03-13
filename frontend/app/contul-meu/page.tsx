'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Anunt } from '@/lib/types';
import AnuntCard from '@/components/AnuntCard';
import Link from 'next/link';

export default function ContulMeuPage() {
  const { user } = useAuth();
  const [anunturi, setAnunturi] = useState<Anunt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/api/anunturi/user/anunturile-mele')
      .then(setAnunturi)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Link href="/auth/login" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium">Autentifică-te</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contul meu</h1>
          <p className="text-gray-500">{user.prenume} {user.nume} — {user.email}</p>
        </div>
        <Link href="/adauga-anunt"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition">
          + Anunț nou
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Anunțurile mele ({anunturi.length})
      </h2>

      {loading ? (
        <p className="text-gray-500">Se încarcă...</p>
      ) : anunturi.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nu ai niciun anunț publicat</h3>
          <p className="text-gray-500 mb-6">Publică primul tău anunț și ajunge direct la cumpărători</p>
          <Link href="/adauga-anunt"
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition inline-block">
            Publică un anunț
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {anunturi.map(anunt => <AnuntCard key={anunt.id} anunt={anunt} />)}
        </div>
      )}
    </div>
  );
}
