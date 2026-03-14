import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Ești un agent AI specializat în imobiliare din România și Moldova.
Ajuți proprietarii să creeze anunțuri imobiliare profesioniste.

Comportament:
- Poartă o conversație naturală, prietenoasă și în limba română
- Colectează informații esențiale despre imobil prin întrebări clare
- Când ai suficiente date, generează automat titlul și descrierea anunțului
- Informații de colectat: tip imobil, localitate/zonă, suprafață, nr camere, etaj, an construcție, dotări, preț, stare imobil
- Titlul trebuie să fie concis și atrăgător (max 100 caractere), să includă tipul, suprafața, zona și să menționeze "proprietar direct, fără comision"
- Descrierea trebuie să fie de 300-500 cuvinte, structurată, cu puncte forte evidențiate
- Când generezi anunțul final, formatează-l clar cu secțiunile: TITLU:, DESCRIERE:, PREȚ ESTIMAT:

Nu inventa informații. Dacă nu știi ceva, întreabă utilizatorul.`

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  try {
    const { message, conversation_history = [] } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key') {
      return NextResponse.json({
        response: `[MOD DEMO] Bună! Sunt agentul tău AI pentru imobiliare 🏠\n\nHai să creăm împreună un anunț profesionist.\n\nÎn ce oraș se află imobilul pe care vrei să-l vinzi sau închiriezi?`,
        anunt_generat: null
      })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const messages: Anthropic.MessageParam[] = [
      ...conversation_history
        .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
        .map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message }
    ]

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    let anuntGenerat = null
    if (aiResponse.includes('TITLU:') && aiResponse.includes('DESCRIERE:')) {
      const lines = aiResponse.split('\n')
      let titlu = ''
      const descriereLines: string[] = []
      let inDescriere = false

      for (const line of lines) {
        if (line.startsWith('TITLU:')) {
          titlu = line.replace('TITLU:', '').trim()
        } else if (line.startsWith('DESCRIERE:')) {
          inDescriere = true
        } else if (inDescriere && !line.startsWith('PREȚ')) {
          descriereLines.push(line)
        }
      }

      if (titlu) {
        anuntGenerat = { titlu, descriere: descriereLines.join('\n').trim() }
      }
    }

    return NextResponse.json({ response: aiResponse, anunt_generat: anuntGenerat })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
