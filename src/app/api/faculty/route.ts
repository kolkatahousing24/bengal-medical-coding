import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/faculty — List all faculty
export async function GET() {
  try {
    const faculty = await db.faculty.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: faculty })
  } catch (error) {
    console.error('Fetch faculty error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

// POST /api/faculty — Add new faculty member
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const designation = formData.get('designation') as string
    const qualification = formData.get('qualification') as string
    const experience = formData.get('experience') as string
    const specialization = formData.get('specialization') as string
    const file = formData.get('photo') as File | null

    if (!name || !designation || !qualification) {
      return NextResponse.json({ success: false, error: 'Name, designation, and qualification are required' }, { status: 400 })
    }

    let photoUrl: string | null = null

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 })
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = path.extname(file.name) || '.jpg'
      const filename = `faculty-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'faculty')
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)

      photoUrl = `/uploads/faculty/${filename}`
    }

    const faculty = await db.faculty.create({
      data: {
        name,
        designation,
        qualification,
        experience: experience || '',
        specialization: specialization || '',
        photoUrl,
      },
    })

    return NextResponse.json({ success: true, data: faculty }, { status: 201 })
  } catch (error) {
    console.error('Faculty add error:', error)
    return NextResponse.json({ success: false, error: 'Failed to add faculty' }, { status: 500 })
  }
}

// DELETE /api/faculty — Delete a faculty member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Faculty ID is required' }, { status: 400 })
    }

    await db.faculty.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Faculty deleted successfully' } })
  } catch (error) {
    console.error('Faculty delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete faculty' }, { status: 500 })
  }
}
