import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'imofree-secret-key-2026-minimum-32-characters'
)

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Creează profil dacă nu există
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const fullName = data.user.user_metadata?.full_name || ''
        const parts = fullName.split(' ')
        const prenume = parts[0] || ''
        const nume = parts.slice(1).join(' ') || ''

        await supabaseAdmin.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          nume,
          prenume,
          este_premium: false,
        })
      }

      // Generează JWT pentru frontend
      const token = await new SignJWT({ sub: data.user.id, email: data.user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

      // Redirecționează cu token în URL (preluat de frontend)
      const redirectUrl = new URL('/auth/google-success', origin)
      redirectUrl.searchParams.set('token', token)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=google', origin))
}
