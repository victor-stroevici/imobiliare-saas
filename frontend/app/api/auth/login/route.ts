import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'imofree-secret-key-2026-minimum-32-characters'
)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return NextResponse.json({ detail: 'Email sau parolă incorectă' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const user = profile || { id: data.user.id, email, nume: '', prenume: '', este_premium: false, created_at: data.user.created_at }

    const token = await new SignJWT({ sub: data.user.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    return NextResponse.json({ access_token: token, token_type: 'bearer', user })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
