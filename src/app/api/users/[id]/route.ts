import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/users/[id] - Get user by id with profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const found = await db.user.findUnique({ where: { id } })

    if (!found) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Non-admin users can only see their own profile
    if (user.role !== 'admin' && user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Fetch profiles separately (no FK relationships in Supabase)
    const [studentProfile, teacherProfile, loginHistory] = await Promise.all([
      db.studentProfile.findUnique({ where: { userId: id } }),
      db.teacherProfile.findUnique({ where: { userId: id } }),
      db.loginHistory.findMany({ where: { userId: id }, orderBy: { loginAt: 'desc' }, take: 10 }),
    ])

    // Remove password from response
    const { password: _, ...safeUser } = found

    return NextResponse.json({ success: true, data: { ...safeUser, studentProfile, teacherProfile, loginHistory } })
  } catch (error) {
    console.error('[USER_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user (admin or self)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Only admin or the user themselves can update
    if (user.role !== 'admin' && user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, mobile, profilePhoto, status, designation, qualification, experience, specialization } = body

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Update user basic info
    const updated = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(mobile !== undefined && { mobile }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(status !== undefined && user.role === 'admin' && { status }),
      },
    })

    // Update teacher profile separately if needed
    if (designation !== undefined || qualification !== undefined || experience !== undefined || specialization !== undefined) {
      const tp = await db.teacherProfile.findUnique({ where: { userId: id } })
      if (tp) {
        await db.teacherProfile.update({
          where: { id: tp.id },
          data: {
            ...(designation !== undefined && { designation }),
            ...(qualification !== undefined && { qualification }),
            ...(experience !== undefined && { experience }),
            ...(specialization !== undefined && { specialization }),
          },
        })
      }
    }

    // Fetch updated profiles
    const [studentProfile, teacherProfile] = await Promise.all([
      db.studentProfile.findUnique({ where: { userId: id } }),
      db.teacherProfile.findUnique({ where: { userId: id } }),
    ])

    const { password: _, ...safeUser } = updated

    return NextResponse.json({ success: true, data: { ...safeUser, studentProfile, teacherProfile } })
  } catch (error) {
    console.error('[USER_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'User deleted successfully' } })
  } catch (error) {
    console.error('[USER_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
