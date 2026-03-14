import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '12')
    const tipImobil = searchParams.get('tip_imobil')
    const tipTranzactie = searchParams.get('tip_tranzactie')
    const oras = searchParams.get('oras')
    const pretMin = searchParams.get('pret_min')
    const pretMax = searchParams.get('pret_max')
    const nrCamere = searchParams.get('nr_camere')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('anunturi')
      .select('*, poze:poze_anunturi(*), proprietar:profiles!proprietar_id(*)', { count: 'exact' })
      .eq('status', 'activ')
      .order('este_promovat', { ascending: false })
      .order('created_at', { ascending: false })

    if (tipImobil) query = query.eq('tip_imobil', tipImobil)
    if (tipTranzactie) query = query.eq('tip_tranzactie', tipTranzactie)
    if (oras) query = query.ilike('oras', `%${oras}%`)
    if (pretMin) query = query.gte('pret', parseFloat(pretMin))
    if (pretMax) query = query.lte('pret', parseFloat(pretMax))
    if (nrCamere) query = query.eq('nr_camere', parseInt(nrCamere))
    if (search) query = query.or(`titlu.ilike.%${search}%,descriere.ilike.%${search}%,oras.ilike.%${search}%`)

    const from = (page - 1) * perPage
    const to = from + perPage - 1
    const { data, error, count } = await query.range(from, to)

    if (error) return NextResponse.json({ detail: error.message }, { status: 500 })

    return NextResponse.json({ items: data || [], total: count || 0, page, per_page: perPage })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('anunturi')
      .insert({ ...body, proprietar_id: user.userId, status: 'activ', vizualizari: 0 })
      .select('*, poze:poze_anunturi(*), proprietar:profiles!proprietar_id(*)')
      .single()

    if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
