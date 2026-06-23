import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/enrollments/[id] - Update enrollment progress
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
    const body = await request.json()
    const { progress, status, completedAt } = body

    const existing = await db.enrollment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }

    const updated = await db.enrollment.update({
      where: { id },
      data: {
        ...(progress !== undefined && { progress }),
        ...(status !== undefined && { status }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[ENROLLMENT_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
