import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'imofree-secret-key-2026-minimum-32-characters'
)

export async function POST(req: NextRequest) {
  try {
    const { email, password, nume, prenume, telefon } = await req.json()

    if (!email || !password || !nume || !prenume) {
      return NextResponse.json({ detail: 'Câmpuri obligatorii lipsesc' }, { status: 400 })
    }

    // Creează user în Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json({ detail: 'Email-ul este deja înregistrat' }, { status: 400 })
      }
      return NextResponse.json({ detail: authError?.message || 'Eroare creare cont' }, { status: 400 })
    }

    // Creează profilul în tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        nume,
        prenume,
        telefon: telefon || null,
        este_premium: false,
      })

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    const user = { id: authData.user.id, email, nume, prenume, telefon, este_premium: false, created_at: authData.user.created_at }

    const token = await new SignJWT({ sub: authData.user.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    return NextResponse.json({ access_token: token, token_type: 'bearer', user })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Eroare necunoscută'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
