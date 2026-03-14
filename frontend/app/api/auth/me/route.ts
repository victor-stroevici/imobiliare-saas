import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'imofree-secret-key-2026-minimum-32-characters'
)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Neautorizat' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ detail: 'Utilizatorul nu a fost găsit' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ detail: 'Token invalid' }, { status: 401 })
  }
}
