import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reviews — List all reviews
export async function GET() {
  try {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    console.error('Fetch reviews error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — Add new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, reviewText, rating, course, placement, type } = body

    if (!studentName || !reviewText || !rating) {
      return NextResponse.json({ success: false, error: 'Student name, review text, and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await db.review.create({
      data: {
        studentName,
        reviewText,
        rating: parseInt(String(rating)),
        course: course || null,
        placement: placement || null,
        type: type || 'text',
      },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error('Review add error:', error)
    return NextResponse.json({ success: false, error: 'Failed to add review' }, { status: 500 })
  }
}

// DELETE /api/reviews — Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 })
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Review deleted successfully' } })
  } catch (error) {
    console.error('Review delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}
