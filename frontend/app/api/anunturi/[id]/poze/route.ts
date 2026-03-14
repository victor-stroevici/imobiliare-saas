import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  try {
    const { data: anunt } = await supabaseAdmin.from('anunturi').select('proprietar_id').eq('id', id).single()
    if (!anunt || anunt.proprietar_id !== user.userId) {
      return NextResponse.json({ detail: 'Acces interzis' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ detail: 'Fișierul lipsește' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const filename = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('poze-anunturi')
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (uploadError) return NextResponse.json({ detail: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = supabaseAdmin.storage.from('poze-anunturi').getPublicUrl(filename)

    const { count } = await supabaseAdmin.from('poze_anunturi').select('*', { count: 'exact' }).eq('anunt_id', id)
    const isPrimary = (count || 0) === 0

    if (isPrimary) {
      await supabaseAdmin.from('poze_anunturi').update({ este_principala: false }).eq('anunt_id', id)
    }

    const { data: poza, error } = await supabaseAdmin
      .from('poze_anunturi')
      .insert({ anunt_id: parseInt(id), url: publicUrl, este_principala: isPrimary, ordine: count || 0 })
      .select().single()

    if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
    return NextResponse.json(poza)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
