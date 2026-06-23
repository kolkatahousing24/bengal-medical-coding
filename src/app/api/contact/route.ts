import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const contacts = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error('Fetch contacts error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch contact messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, message } = body

    // Validate required fields
    if (!name || !phone || !email || !message) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Save to database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        phone,
        email,
        message,
      },
    })

    return NextResponse.json({ success: true, data: contactMessage }, { status: 201 })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Contact message ID is required' }, { status: 400 })
    }

    await db.contactMessage.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Contact message deleted successfully' } })
  } catch (error) {
    console.error('Contact delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete contact message' }, { status: 500 })
  }
}
