import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('anunturi')
    .select('*, poze:poze_anunturi(*)')
    .eq('proprietar_id', user.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
