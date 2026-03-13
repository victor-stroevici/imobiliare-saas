import Link from 'next/link';
import { Anunt } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TIP_LABELS: Record<string, string> = {
  apartament: 'Apartament', casa: 'Casă', teren: 'Teren',
  spatiu_comercial: 'Spațiu comercial', garsoniera: 'Garsonieră', industrial: 'Industrial'
};

export default function AnuntCard({ anunt }: { anunt: Anunt }) {
  const pozaPrincipala = anunt.poze?.find(p => p.este_principala) || anunt.poze?.[0];
  const pretFormatat = new Intl.NumberFormat('ro-RO').format(anunt.pret);

  return (
    <Link href={`/anunt/${anunt.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative h-48 bg-gray-100">
          {pozaPrincipala ? (
            <img
              src={`${API_URL}${pozaPrincipala.url}`}
              alt={anunt.titlu}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium">
              {TIP_LABELS[anunt.tip_imobil] || anunt.tip_imobil}
            </span>
            {anunt.dosar_verificat && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                Verificat
              </span>
            )}
            {anunt.este_promovat && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                Promovat
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 leading-snug">
            {anunt.titlu}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {anunt.suprafata_utila && (
              <span>{anunt.suprafata_utila} mp</span>
            )}
            {anunt.nr_camere && (
              <span>{anunt.nr_camere} cam.</span>
            )}
            {anunt.etaj !== undefined && anunt.etaj !== null && (
              <span>Et. {anunt.etaj}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-green-700">
                {pretFormatat} {anunt.moneda}
              </p>
              <p className="text-xs text-gray-500">{anunt.oras}{anunt.judet ? `, ${anunt.judet}` : ''}</p>
            </div>
            <div className="text-xs text-gray-400">
              {anunt.vizualizari} vizualizări
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
