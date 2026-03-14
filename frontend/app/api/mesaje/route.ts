import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  try {
    const { anunt_id, destinatar_id, continut } = await req.json()
    const { data, error } = await supabaseAdmin
      .from('mesaje')
      .insert({ anunt_id, expeditor_id: user.userId, destinatar_id, continut, este_citit: false })
      .select().single()

    if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('mesaje')
    .select('*')
    .eq('destinatar_id', user.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
