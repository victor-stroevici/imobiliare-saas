'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', nume: '', prenume: '', telefon: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">IF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Creează cont gratuit</h1>
          <p className="text-gray-500 text-sm mt-1">Vinde sau cumpără fără comisioane</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
              <input type="text" required value={form.prenume}
                onChange={e => setForm({...form, prenume: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ion" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
              <input type="text" required value={form.nume}
                onChange={e => setForm({...form, nume: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Popescu" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@exemplu.ro" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (opțional)</label>
            <input type="tel" value={form.telefon}
              onChange={e => setForm({...form, telefon: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+40 7xx xxx xxx" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
            <input type="password" required minLength={6} value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Min. 6 caractere" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50">
            {loading ? 'Se creează contul...' : 'Creează cont gratuit'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ai deja cont?{' '}
          <Link href="/auth/login" className="text-green-600 font-medium hover:underline">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}
