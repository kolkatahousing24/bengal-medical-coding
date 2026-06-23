import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/lessons - Create lesson
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { moduleId, title, type, content, videoUrl, pdfUrl, duration, order } = body

    if (!moduleId || !title) {
      return NextResponse.json({ success: false, error: 'Module ID and title are required' }, { status: 400 })
    }

    const module_ = await db.module.findUnique({ where: { id: moduleId } })
    if (!module_) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
    }

    const lesson = await db.lesson.create({
      data: {
        moduleId,
        title,
        type: type || 'video',
        content: content || null,
        videoUrl: videoUrl || null,
        pdfUrl: pdfUrl || null,
        duration: duration || null,
        order: order ?? 0,
      },
      include: { module: { select: { id: true, title: true } } },
    })

    return NextResponse.json({ success: true, data: lesson }, { status: 201 })
  } catch (error) {
    console.error('[LESSONS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
