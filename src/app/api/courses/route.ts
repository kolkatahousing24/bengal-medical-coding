import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const all = searchParams.get('all')

    const where: any = {}
    if (all !== 'true' && status) {
      where.status = status
    } else if (all !== 'true') {
      // Default: only published for public
      where.status = 'published'
    }
    // all=true returns all statuses (for admin)

    const courses = await db.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    console.error('Fetch courses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
        '-' + Date.now().toString(36)
    }

    const course = await db.course.create({ data })
    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    await db.course.delete({ where: { id } })
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
