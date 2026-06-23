import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mobile: true,
        status: true,
        createdAt: true,
        studentProfile: { select: { enrollmentNo: true, courseIds: true } },
        teacherProfile: { select: { designation: true, specialization: true, qualification: true, experience: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, mobile, designation, qualification, specialization, experience } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        mobile: mobile || null,
      },
    })

    // Create profile based on role
    if (role === 'student') {
      const enrollmentNo = `STU-${Date.now().toString(36).toUpperCase()}`
      await db.studentProfile.create({
        data: { userId: user.id, enrollmentNo },
      })
    } else if (role === 'teacher') {
      await db.teacherProfile.create({
        data: {
          userId: user.id,
          designation: designation || 'Instructor',
          qualification: qualification || null,
          specialization: specialization || null,
          experience: experience || null,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { message: 'User deleted successfully' } })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}
