import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()
    if (!token || !newPassword) return NextResponse.json({ success: false, error: 'Token and new password required' }, { status: 400 })

    const reset = await db.passwordReset.findUnique({ where: { token } })
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 })
    }

    const hash = await hashPassword(newPassword)
    await db.user.update({ where: { email: reset.email }, data: { password: hash } })
    await db.passwordReset.update({ where: { id: reset.id }, data: { used: true } })

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
