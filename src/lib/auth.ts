import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'

const SESSION_SECRET = process.env.SESSION_SECRET || 'bengal-medical-coding-secret-key-2024'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 8)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createSessionToken(userId: string, role: string): string {
  const payload = JSON.stringify({ userId, role, ts: Date.now() })
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(payload, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function verifySessionToken(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split(':')
    if (parts.length !== 2) return null
    const iv = Buffer.from(parts[0], 'hex')
    const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(parts[1], 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    const payload = JSON.parse(decrypted)
    if (Date.now() - payload.ts > 24 * 60 * 60 * 1000) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<{ id: string; email: string; role: string; name: string; profilePhoto?: string | null } | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null

    const decoded = verifySessionToken(session)
    if (!decoded) return null

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, profilePhoto: true },
    })

    return user
  } catch {
    return null
  }
}
