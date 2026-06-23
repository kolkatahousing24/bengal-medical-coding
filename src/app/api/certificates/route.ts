import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/certificates - List certificates, support ?studentId= filter
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const where: any = {}

    // Students can only see their own certificates
    if (user.role === 'student') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: user.id },
      })
      if (!studentProfile) {
        return NextResponse.json({ success: true, data: [] })
      }
      where.studentId = studentProfile.id
    } else if (studentId) {
      where.studentId = studentId
    }

    const certificates = await db.certificate.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: certificates })
  } catch (error) {
    console.error('[CERTIFICATES_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/certificates - Create certificate
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, courseId, type, title, fileUrl } = body

    if (!studentId || !title) {
      return NextResponse.json({ success: false, error: 'Student ID and title are required' }, { status: 400 })
    }

    const certificate = await db.certificate.create({
      data: {
        studentId,
        courseId: courseId || null,
        type: type || 'completion',
        title,
        fileUrl: fileUrl || null,
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: certificate }, { status: 201 })
  } catch (error) {
    console.error('[CERTIFICATES_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
