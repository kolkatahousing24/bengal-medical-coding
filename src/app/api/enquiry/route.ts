import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, qualification, message } = body

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Save to database
    const enquiry = await db.enquiry.create({
      data: {
        fullName: name,
        mobile: phone,
        email,
        qualification: qualification || null,
        message: message || null,
        source: body.source || 'enquiry',
      },
    })

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 })
  } catch (error) {
    console.error('Enquiry submission error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit enquiry. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const enquiries = await db.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: enquiries })
  } catch (error) {
    console.error('Fetch enquiries error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Enquiry ID is required' }, { status: 400 })
    }

    await db.enquiry.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Enquiry deleted successfully' } })
  } catch (error) {
    console.error('Enquiry delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete enquiry' }, { status: 500 })
  }
}
