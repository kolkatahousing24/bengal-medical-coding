import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/blogs/[id] - Update blog
export async function PUT(
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
    const body = await request.json()
    const { title, slug, description, content, featuredImage, tags, hashtags, status } = body

    const existing = await db.blog.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 })
    }

    // Check slug uniqueness if slug is being changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.blog.findUnique({ where: { slug } })
      if (slugExists) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
      }
    }

    const updated = await db.blog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(hashtags !== undefined && { hashtags: JSON.stringify(hashtags) }),
        ...(status !== undefined && { status }),
        ...(status === 'published' && !existing.publishedAt && { publishedAt: new Date() }),
      },
    })

    // Fetch author separately (no FK relationships in Supabase)
    let authorData: { id: string; name: string; profilePhoto: string | null } | null = null
    if (updated.authorId) {
      const author = await db.user.findUnique({ where: { id: updated.authorId } })
      if (author) {
        authorData = { id: author.id, name: author.name, profilePhoto: author.profilePhoto }
      }
    }

    return NextResponse.json({ success: true, data: { ...updated, author: authorData } })
  } catch (error) {
    console.error('[BLOG_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/blogs/[id] - Delete blog
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
    const existing = await db.blog.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 })
    }

    await db.blog.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Blog deleted successfully' } })
  } catch (error) {
    console.error('[BLOG_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
