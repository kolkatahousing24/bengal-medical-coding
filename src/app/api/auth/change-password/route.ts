import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, hashPassword, getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) return NextResponse.json({ success: false, error: 'Both passwords required' }, { status: 400 })

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const valid = await comparePassword(currentPassword, dbUser.password)
    if (!valid) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 })

    const hash = await hashPassword(newPassword)
    await db.user.update({ where: { id: user.id }, data: { password: hash } })

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
