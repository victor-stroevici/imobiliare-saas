import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { data, error } = await supabaseAdmin
      .from('anunturi')
      .select('*, poze:poze_anunturi(*), proprietar:profiles!proprietar_id(*)')
      .eq('id', id)
      .single()

    if (error || !data) return NextResponse.json({ detail: 'Anunțul nu a fost găsit' }, { status: 404 })

    // Increment vizualizari
    await supabaseAdmin.from('anunturi').update({ vizualizari: (data.vizualizari || 0) + 1 }).eq('id', id)

    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  try {
    const body = await req.json()
    const { data: existing } = await supabaseAdmin.from('anunturi').select('proprietar_id').eq('id', id).single()
    if (!existing || existing.proprietar_id !== user.userId) {
      return NextResponse.json({ detail: 'Acces interzis' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('anunturi').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id)
      .select('*, poze:poze_anunturi(*), proprietar:profiles!proprietar_id(*)')
      .single()

    if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  const { data: existing } = await supabaseAdmin.from('anunturi').select('proprietar_id').eq('id', id).single()
  if (!existing || existing.proprietar_id !== user.userId) {
    return NextResponse.json({ detail: 'Acces interzis' }, { status: 403 })
  }

  await supabaseAdmin.from('anunturi').delete().eq('id', id)
  return NextResponse.json({ message: 'Anunțul a fost șters' })
}
