import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'imofree-secret-key-2026-minimum-32-characters'
)

export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.sub as string, email: payload.email as string }
  } catch {
    return null
  }
}
