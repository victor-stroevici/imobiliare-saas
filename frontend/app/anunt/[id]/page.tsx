'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Anunt } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TIP_LABELS: Record<string, string> = {
  apartament: 'Apartament', casa: 'Casă', teren: 'Teren',
  spatiu_comercial: 'Spațiu comercial', garsoniera: 'Garsonieră', industrial: 'Industrial'
};

export default function AnuntPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [anunt, setAnunt] = useState<Anunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [poza, setPoza] = useState(0);
  const [mesaj, setMesaj] = useState('');
  const [mesajTrimis, setMesajTrimis] = useState(false);

  useEffect(() => {
    api.get(`/api/anunturi/${id}`)
      .then(setAnunt)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const trimiteMessaj = async () => {
    if (!mesaj.trim() || !anunt) return;
    try {
      await api.post('/api/mesaje', {
        anunt_id: anunt.id,
        destinatar_id: anunt.proprietar_id,
        continut: mesaj
      });
      setMesajTrimis(true);
      setMesaj('');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Eroare necunoscută');
    }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl mb-8" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );

  if (!anunt) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Anunțul nu a fost găsit</h2>
      <Link href="/anunturi" className="text-green-600 mt-4 inline-block">Înapoi la anunțuri</Link>
    </div>
  );

  const pretFormatat = new Intl.NumberFormat('ro-RO').format(anunt.pret);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/anunturi" className="text-green-600 text-sm hover:underline mb-4 inline-block">
        Înapoi la anunțuri
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 mt-4">
        {/* Stânga: poze + detalii */}
        <div className="lg:col-span-2">
          {/* Galerie */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 mb-4">
            {anunt.poze.length > 0 ? (
              <img
                src={`${API_URL}${anunt.poze[poza]?.url}`}
                alt={anunt.titlu}
                className="w-full h-72 md:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-72 md:h-96 flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}
          </div>

          {anunt.poze.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {anunt.poze.map((p, i) => (
                <img
                  key={p.id}
                  src={`${API_URL}${p.url}`}
                  alt=""
                  onClick={() => setPoza(i)}
                  className={`w-20 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 ${i === poza ? 'ring-2 ring-green-500' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          )}

          {/* Titlu + badges */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                {TIP_LABELS[anunt.tip_imobil]}
              </span>
              {anunt.dosar_verificat && (
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                  Dosar verificat
                </span>
              )}
              <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                Proprietar direct
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 leading-snug">{anunt.titlu}</h1>
            <p className="text-gray-500 mt-2">
              {anunt.oras}{anunt.judet ? `, ${anunt.judet}` : ''}{anunt.adresa ? ` — ${anunt.adresa}` : ''}
            </p>
          </div>

          {/* Caracteristici */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {anunt.suprafata_utila && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{anunt.suprafata_utila}</p>
                <p className="text-xs text-gray-500">mp utili</p>
              </div>
            )}
            {anunt.nr_camere && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{anunt.nr_camere}</p>
                <p className="text-xs text-gray-500">camere</p>
              </div>
            )}
            {anunt.nr_bai && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{anunt.nr_bai}</p>
                <p className="text-xs text-gray-500">băi</p>
              </div>
            )}
            {anunt.etaj !== undefined && anunt.etaj !== null && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{anunt.etaj}</p>
                <p className="text-xs text-gray-500">etaj</p>
              </div>
            )}
          </div>

          {/* Dotări */}
          <div className="flex flex-wrap gap-2 mb-6">
            {anunt.are_centrala_proprie && <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">Centrală proprie</span>}
            {anunt.are_parcare && <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">Parcare</span>}
            {anunt.are_balcon && <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">Balcon</span>}
            {anunt.are_ac && <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">Aer condiționat</span>}
            {anunt.are_lift && <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">Lift</span>}
            {anunt.dotari?.map(d => <span key={d} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">{d}</span>)}
          </div>

          {/* Descriere */}
          {anunt.descriere && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <h3 className="font-semibold text-gray-800 mb-3 text-base">Descriere</h3>
              <p className="whitespace-pre-line">{anunt.descriere}</p>
            </div>
          )}
        </div>

        {/* Dreapta: preț + contact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
            <p className="text-3xl font-bold text-green-700 mb-1">
              {pretFormatat} {anunt.moneda}
            </p>
            {anunt.suprafata_utila && (
              <p className="text-sm text-gray-500 mb-4">
                {Math.round(anunt.pret / anunt.suprafata_utila).toLocaleString('ro-RO')} {anunt.moneda}/mp
              </p>
            )}

            <div className="border-t pt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Proprietar direct</p>
              {anunt.proprietar && (
                <p className="text-sm text-gray-600">{anunt.proprietar.prenume} {anunt.proprietar.nume}</p>
              )}
              {anunt.proprietar?.telefon && (
                <a href={`tel:${anunt.proprietar.telefon}`} className="text-green-600 text-sm font-medium mt-1 block hover:underline">
                  {anunt.proprietar.telefon}
                </a>
              )}
            </div>

            {user && user.id !== anunt.proprietar_id ? (
              mesajTrimis ? (
                <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm text-center">
                  Mesaj trimis! Proprietarul te va contacta în curând.
                </div>
              ) : (
                <div>
                  <textarea
                    value={mesaj}
                    onChange={e => setMesaj(e.target.value)}
                    placeholder="Scrie un mesaj proprietarului..."
                    className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                  />
                  <button
                    onClick={trimiteMessaj}
                    disabled={!mesaj.trim()}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Trimite mesaj
                  </button>
                </div>
              )
            ) : !user ? (
              <Link href="/auth/login" className="block w-full bg-green-600 text-white py-3 rounded-xl font-medium text-center hover:bg-green-700 transition">
                Autentifică-te pentru a contacta
              </Link>
            ) : null}

            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 font-medium mb-1">Ai nevoie de asistență juridică?</p>
              <p className="text-xs text-blue-600">Avocații noștri parteneri te ajută să verifici documentele și să semnezi în siguranță.</p>
              <button className="mt-2 text-xs text-blue-700 font-medium hover:underline">
                Solicită consultanță
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              {anunt.vizualizari} vizualizări
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
