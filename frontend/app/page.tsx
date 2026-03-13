import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block bg-green-600/50 text-green-100 text-sm px-4 py-2 rounded-full mb-6 font-medium">
            Imobiliare directe între particulari
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Vinzi sau cumperi fără<br />
            <span className="text-green-300">intermediari</span>
          </h1>
          <p className="text-xl text-green-100 mb-4 max-w-2xl mx-auto">
            Fără comisioane ascunse. Fără agenții. Cu protecție juridică reală.
          </p>
          <p className="text-green-200 mb-10 text-sm">
            Economisești <strong>3-5%</strong> din valoarea imobilului — adică mii sau zeci de mii de euro
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/adauga-anunt"
              className="bg-white text-green-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition shadow-lg"
            >
              Vând un imobil
            </Link>
            <Link
              href="/anunturi"
              className="bg-green-600 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500 transition"
            >
              Caut un imobil
            </Link>
          </div>
        </div>
      </section>

      {/* Cum funcționează */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Cum funcționează?</h2>
          <p className="text-center text-gray-500 mb-12">3 pași simpli până la tranzacția imobiliară</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                nr: '1',
                icon: '🤖',
                titlu: 'Creezi anunțul cu AI',
                desc: 'Povestești despre imobilul tău, încarci câteva poze — agentul nostru AI îți creează un anunț profesionist în câteva minute.'
              },
              {
                nr: '2',
                icon: '📞',
                titlu: 'Cumpărătorii te contactează direct',
                desc: 'Primești mesaje direct de la cumpărători interesați. Nicio agenție intermediară, nicio presiune inutilă.'
              },
              {
                nr: '3',
                icon: '⚖️',
                titlu: 'Asistență juridică la semnare',
                desc: 'Avocații noștri parteneri te ajută să verifici totul legal înainte de semnarea contractului.'
              }
            ].map((step) => (
              <div key={step.nr} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 transition">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{step.titlu}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficii */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            De ce ImoFree?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '💰', titlu: 'Zero comisioane la tranzacție', desc: 'Agențiile cer 3-5% din valoarea vânzării. La un apartament de 100.000€, asta înseamnă 3.000-5.000€ economisiți.' },
              { icon: '🤖', titlu: 'Anunțuri profesioniste cu AI', desc: 'Nu trebuie să fii expert în copywriting. Agentul nostru AI îți creează un anunț atractiv bazat pe câteva informații simple.' },
              { icon: '🔍', titlu: 'Verificare anti-fraud', desc: 'Fiecare anunț este verificat prin cartea funciară și dosarul cadastral. Cumperi cu încredere.' },
              { icon: '⚖️', titlu: 'Protecție juridică reală', desc: 'Avocați licențiați specializați în imobiliare disponibili pentru consultanță, verificare dosar și asistență la semnare.' },
            ].map((b) => (
              <div key={b.titlu} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl flex-shrink-0">{b.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">{b.titlu}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-green-700 text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Gata să economisești mii de euro?</h2>
          <p className="text-green-200 mb-8">Înregistrează-te gratuit și publică primul tău anunț în 10 minute.</p>
          <Link
            href="/auth/register"
            className="bg-white text-green-800 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition shadow-lg inline-block"
          >
            Creează cont gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
