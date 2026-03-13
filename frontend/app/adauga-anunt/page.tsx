'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AdaugaAnuntPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'ai' | 'form'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bună! Sunt agentul tău AI pentru imobiliare.\n\nHai să creăm împreună un anunț profesionist care să-ți atragă cumpărătorii potriviți.\n\nÎncepe prin a-mi spune: în ce oraș se află imobilul pe care vrei să-l vinzi sau închiriezi?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [anuntGenerat, setAnuntGenerat] = useState<{ titlu: string; descriere: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    titlu: '', descriere: '', tip_imobil: 'apartament', tip_tranzactie: 'vanzare',
    pret: '', moneda: 'EUR', suprafata_utila: '', suprafata_construita: '',
    nr_camere: '', nr_bai: '', etaj: '', an_constructie: '',
    oras: '', judet: '', adresa: '',
    are_centrala_proprie: false, are_parcare: false, are_balcon: false, are_ac: false, are_lift: false,
  });
  const [poze, setPoze] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  if (!user) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Autentificare necesară</h2>
      <p className="text-gray-500 mb-6">Trebuie să fii autentificat pentru a publica un anunț.</p>
      <Link href="/auth/login" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition">
        Autentifică-te
      </Link>
    </div>
  );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const data = await api.post('/api/ai/chat', {
        message: userMessage,
        conversation_history: newMessages.slice(0, -1),
        anunt_data: {}
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      if (data.anunt_generat) {
        setAnuntGenerat(data.anunt_generat);
        setForm(prev => ({ ...prev, titlu: data.anunt_generat.titlu, descriere: data.anunt_generat.descriere }));
      }
    } catch (e: unknown) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Îmi pare rău, a apărut o eroare: ${e instanceof Error ? e.message : 'Eroare necunoscută'}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSave = async () => {
    if (!form.titlu || !form.pret || !form.oras) {
      alert('Completează titlul, prețul și orașul!');
      return;
    }
    setSaving(true);
    try {
      const anuntData = {
        ...form,
        pret: parseFloat(form.pret),
        suprafata_utila: form.suprafata_utila ? parseFloat(form.suprafata_utila) : null,
        suprafata_construita: form.suprafata_construita ? parseFloat(form.suprafata_construita) : null,
        nr_camere: form.nr_camere ? parseInt(form.nr_camere) : null,
        nr_bai: form.nr_bai ? parseInt(form.nr_bai) : null,
        etaj: form.etaj ? parseInt(form.etaj) : null,
        an_constructie: form.an_constructie ? parseInt(form.an_constructie) : null,
      };

      const anunt = await api.post('/api/anunturi', anuntData);

      for (const poza of poze) {
        const formData = new FormData();
        formData.append('file', poza);
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/anunturi/${anunt.id}/poze`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }

      router.push(`/anunt/${anunt.id}`);
    } catch (e: unknown) {
      alert(`Eroare: ${e instanceof Error ? e.message : 'Eroare necunoscută'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Publică un anunț</h1>
      <p className="text-gray-500 mb-8">Folosește agentul AI pentru a crea un anunț profesionist</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        <button onClick={() => setStep('ai')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition -mb-px ${step === 'ai' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>
          Agent AI
        </button>
        <button onClick={() => setStep('form')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition -mb-px ${step === 'form' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>
          Completează manual
        </button>
      </div>

      {step === 'ai' ? (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Chat messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Scrie mesajul tău..."
              className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50">
              Trimite
            </button>
          </div>

          {/* Anunț generat */}
          {anuntGenerat && (
            <div className="border-t p-6 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-green-800">Anunț generat de AI</h3>
                <button onClick={() => setStep('form')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  Continuă cu formularul
                </button>
              </div>
              <p className="font-medium text-gray-800 mb-1">{anuntGenerat.titlu}</p>
              <p className="text-sm text-gray-600 line-clamp-3">{anuntGenerat.descriere}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          {/* Titlu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titlu anunț *</label>
            <input type="text" value={form.titlu}
              onChange={e => setForm({...form, titlu: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ex: Apartament 3 camere, 75mp, Floreasca" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tip imobil *</label>
              <select value={form.tip_imobil} onChange={e => setForm({...form, tip_imobil: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {['apartament','casa','garsoniera','teren','spatiu_comercial','industrial'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tip tranzacție *</label>
              <select value={form.tip_tranzactie} onChange={e => setForm({...form, tip_tranzactie: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="vanzare">Vânzare</option>
                <option value="inchiriere">Închiriere</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preț *</label>
              <div className="flex gap-2">
                <input type="number" value={form.pret} onChange={e => setForm({...form, pret: e.target.value})}
                  className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="85000" />
                <select value={form.moneda} onChange={e => setForm({...form, moneda: e.target.value})}
                  className="w-20 border rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>EUR</option><option>RON</option><option>USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suprafață utilă (mp)</label>
              <input type="number" value={form.suprafata_utila} onChange={e => setForm({...form, suprafata_utila: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="65" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nr. camere</label>
              <input type="number" value={form.nr_camere} onChange={e => setForm({...form, nr_camere: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etaj</label>
              <input type="number" value={form.etaj} onChange={e => setForm({...form, etaj: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oraș *</label>
              <input type="text" value={form.oras} onChange={e => setForm({...form, oras: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="București" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Județ</label>
              <input type="text" value={form.judet} onChange={e => setForm({...form, judet: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ilfov" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">An construcție</label>
              <input type="number" value={form.an_constructie} onChange={e => setForm({...form, an_constructie: e.target.value})}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="2005" />
            </div>
          </div>

          {/* Dotări */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Dotări</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'are_centrala_proprie', label: 'Centrală proprie' },
                { key: 'are_parcare', label: 'Parcare' },
                { key: 'are_balcon', label: 'Balcon' },
                { key: 'are_ac', label: 'Aer condiționat' },
                { key: 'are_lift', label: 'Lift' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(form as Record<string, unknown>)[key] as boolean}
                    onChange={e => setForm({...form, [key]: e.target.checked})}
                    className="w-4 h-4 rounded text-green-600" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Descriere */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descriere</label>
            <textarea value={form.descriere} onChange={e => setForm({...form, descriere: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-36"
              placeholder="Descrie imobilul tău..." />
          </div>

          {/* Poze */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fotografii</label>
            <input type="file" multiple accept="image/*"
              onChange={e => setPoze(Array.from(e.target.files || []))}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none" />
            {poze.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">{poze.length} {poze.length === 1 ? 'fotografie selectată' : 'fotografii selectate'}</p>
            )}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50">
            {saving ? 'Se publică...' : 'Publică anunțul'}
          </button>
        </div>
      )}
    </div>
  );
}
