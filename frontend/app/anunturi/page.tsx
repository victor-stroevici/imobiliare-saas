'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AnuntList } from '@/lib/types';
import AnuntCard from '@/components/AnuntCard';

const TIPURI = [
  { value: '', label: 'Toate tipurile' },
  { value: 'apartament', label: 'Apartamente' },
  { value: 'casa', label: 'Case / Vile' },
  { value: 'garsoniera', label: 'Garsoniere' },
  { value: 'teren', label: 'Terenuri' },
  { value: 'spatiu_comercial', label: 'Spații comerciale' },
];

export default function AnunturiPage() {
  const [data, setData] = useState<AnuntList | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    tip_imobil: '',
    oras: '',
    pret_min: '',
    pret_max: '',
    nr_camere: '',
    search: '',
  });

  const fetchAnunturi = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '12' });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const result = await api.get(`/api/anunturi?${params}`);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchAnunturi(); }, [fetchAnunturi]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Anunțuri imobiliare</h1>
        <p className="text-gray-500">Direct de la proprietari. Fără comisioane.</p>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Caută..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="col-span-2 md:col-span-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={filters.tip_imobil}
            onChange={e => handleFilterChange('tip_imobil', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {TIPURI.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="Oraș"
            value={filters.oras}
            onChange={e => handleFilterChange('oras', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Preț min (EUR)"
            value={filters.pret_min}
            onChange={e => handleFilterChange('pret_min', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Preț max (EUR)"
            value={filters.pret_max}
            onChange={e => handleFilterChange('pret_max', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={filters.nr_camere}
            onChange={e => handleFilterChange('nr_camere', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toate camerele</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'cameră' : 'camere'}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">Niciun anunț găsit</h3>
          <p>Încearcă să modifici filtrele de căutare</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.total} anunțuri găsite</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.items.map(anunt => (
              <AnuntCard key={anunt.id} anunt={anunt} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Pagina {page} din {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">
                Următor
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
