import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/gallery — List all gallery images (optional category filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = category && category !== 'all' ? { category } : {}

    const images = await db.galleryImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: images })
  } catch (error) {
    console.error('Fetch gallery error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery images' }, { status: 500 })
  }
}

// POST /api/gallery — Upload new gallery image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string | null
    // Accept both 'image' and 'file' field names for compatibility
    const file = (formData.get('image') as File | null) || (formData.get('file') as File | null)

    if (!title || !category) {
      return NextResponse.json({ success: false, error: 'Title and category are required' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'Image file is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery')
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/gallery/${filename}`

    // Save to database
    const image = await db.galleryImage.create({
      data: {
        title,
        category,
        imageUrl,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: image }, { status: 201 })
  } catch (error) {
    console.error('Gallery upload error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE /api/gallery — Delete a gallery image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Image ID is required' }, { status: 400 })
    }

    const image = await db.galleryImage.findUnique({ where: { id } })
    if (!image) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 })
    }

    // Delete from database
    await db.galleryImage.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Image deleted successfully' } })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 })
  }
}
