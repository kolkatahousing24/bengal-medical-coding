import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const blogs = await db.blog.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Fetch author names separately (no FK relationships in Supabase)
    const authorIds = [...new Set(blogs.map((b: any) => b.authorId).filter(Boolean))]
    const authors = authorIds.length > 0 ? await db.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    }) : []
    const authorMap = Object.fromEntries(authors.map((a: any) => [a.id, a.name]))

    return NextResponse.json({ success: true, data: blogs.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      description: b.description || '',
      content: b.content || '',
      author: authorMap[b.authorId] || 'Unknown',
      authorId: b.authorId,
      status: b.status,
      tags: b.tags,
      hashtags: b.hashtags,
      featuredImage: b.featuredImage || '',
      date: b.publishedAt || b.createdAt,
      createdAt: b.createdAt,
    }))})
  } catch (error) {
    console.error('Blogs fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, content, tags, hashtags, featuredImage, status } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    // Handle tags and hashtags - they might be JSON strings or comma-separated strings
    let tagsStr = '[]'
    let hashtagsStr = '[]'

    if (tags) {
      if (typeof tags === 'string') {
        try {
          // Check if it's already JSON
          const parsed = JSON.parse(tags)
          tagsStr = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([parsed])
        } catch {
          // It's a comma-separated string
          tagsStr = JSON.stringify(tags.split(',').map((t: string) => t.trim()).filter(Boolean))
        }
      } else if (Array.isArray(tags)) {
        tagsStr = JSON.stringify(tags)
      }
    }

    if (hashtags) {
      if (typeof hashtags === 'string') {
        try {
          const parsed = JSON.parse(hashtags)
          hashtagsStr = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([parsed])
        } catch {
          hashtagsStr = JSON.stringify(hashtags.split(',').map((t: string) => t.trim()).filter(Boolean))
        }
      } else if (Array.isArray(hashtags)) {
        hashtagsStr = JSON.stringify(hashtags)
      }
    }

    const blog = await db.blog.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
        description: description || null,
        content: content || null,
        tags: tagsStr,
        hashtags: hashtagsStr,
        featuredImage: featuredImage || null,
        status: status || 'draft',
        authorId: user.id,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: blog })
  } catch (error) {
    console.error('Blog create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await db.blog.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete blog' }, { status: 500 })
  }
}
