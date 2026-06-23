import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalEnquiries, galleryImages, reviews, contacts, faculties] = await Promise.all([
      db.user.count({ where: { role: 'student' } }),
      db.user.count({ where: { role: 'teacher' } }),
      db.course.count(),
      db.enquiry.count(),
      db.galleryImage.count(),
      db.review.count(),
      db.contactMessage.count(),
      db.faculty.count(),
    ])

    const demoClassRequests = await db.enquiry.count({ where: { source: 'demo-class' } })
    const activeLiveClasses = await db.liveClass.count({ where: { status: { in: ['scheduled', 'live'] } } })
    const upcomingExams = await db.exam.count({ where: { status: 'published' } })

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnquiries,
        galleryImages,
        reviews,
        contacts,
        faculties,
        demoClassRequests,
        activeLiveClasses,
        upcomingExams,
        placementRate: 94,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
