import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============ 1. ADMIN USER ============
  const adminEmail = 'admin@bengalmedicalcoding.com';
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('👤 Admin user already exists, skipping...');
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        name: 'Admin',
        mobile: '+919831239669',
        status: 'active',
      },
    });
    console.log('👤 Admin user created successfully');
  }

  // ============ 2. GALLERY IMAGES ============
  const galleryImages = [
    { title: 'Classroom Training Session', category: 'classroom', imageUrl: '/images/gallery/gallery-1.jpg', description: 'Interactive classroom training with experienced medical coding instructors' },
    { title: 'Hands-on Coding Workshop', category: 'workshop', imageUrl: '/images/gallery/gallery-2.jpg', description: 'Students practicing ICD-10 and CPT coding in a workshop setting' },
    { title: 'Annual Graduation Event', category: 'events', imageUrl: '/images/gallery/gallery-3.jpg', description: 'Celebrating our graduates at the annual convocation ceremony' },
    { title: 'Campus Placement Drive', category: 'placement', imageUrl: '/images/gallery/gallery-4.jpg', description: 'Leading healthcare companies visiting for campus recruitment' },
    { title: 'Modern Campus Facilities', category: 'campus', imageUrl: '/images/gallery/gallery-5.jpg', description: 'State-of-the-art campus equipped with modern learning infrastructure' },
    { title: 'Advanced Coding Lab', category: 'classroom', imageUrl: '/images/gallery/gallery-6.jpg', description: 'Dedicated coding lab with access to industry-standard coding tools' },
    { title: 'CPC Exam Preparation Workshop', category: 'workshop', imageUrl: '/images/gallery/gallery-7.jpg', description: 'Intensive CPC exam preparation sessions with mock tests' },
    { title: 'Medical Coding Seminar', category: 'events', imageUrl: '/images/gallery/gallery-8.jpg', description: 'Industry expert seminar on latest medical coding trends and updates' },
    { title: 'Successful Placements Celebration', category: 'placement', imageUrl: '/images/gallery/gallery-9.jpg', description: 'Students celebrating their successful placements in top healthcare MNCs' },
    { title: 'Campus Library & Study Area', category: 'campus', imageUrl: '/images/gallery/gallery-10.jpg', description: 'Well-stocked library and quiet study areas for focused learning' },
  ];

  for (const img of galleryImages) {
    const existing = await db.galleryImage.findFirst({ where: { imageUrl: img.imageUrl } });
    if (existing) {
      console.log(`🖼️  Gallery image "${img.title}" already exists, skipping...`);
    } else {
      await db.galleryImage.create({ data: img });
      console.log(`🖼️  Gallery image "${img.title}" created`);
    }
  }

  // ============ 3. REVIEWS ============
  const reviews = [
    {
      studentName: 'Deblina',
      reviewText: 'Bengal Medical Coding Academy transformed my career completely. The structured training program in ICD-10 and CPT coding gave me the confidence to clear the CPC exam on my first attempt. The faculty is incredibly supportive and always available for doubt clearing. I got placed within two months of completing my course!',
      rating: 5,
      course: 'Advanced Diploma in Medical Coding',
      placement: 'Optum Global Solutions',
      type: 'text',
    },
    {
      studentName: 'Aditi',
      reviewText: 'I enrolled in the CPC Exam Preparation course and it was the best decision I made. The mock tests and practice sessions were very similar to the actual exam pattern. The trainers shared real-world coding scenarios that helped me understand complex medical terminology and coding guidelines. Highly recommended for anyone looking to start a career in medical coding!',
      rating: 5,
      course: 'CPC Exam Preparation',
      placement: 'Cognizant Technology Solutions',
      type: 'text',
    },
    {
      studentName: 'Arpita',
      reviewText: 'The Denial Coding Management course at Bengal Medical Coding Academy is exceptional. I was already working in medical coding but wanted to specialize in denial management. The course content was thorough and practical, covering real claim denial scenarios. The placement assistance was outstanding and I received multiple job offers after completing the course.',
      rating: 4,
      course: 'Denial Coding Management',
      placement: 'Wipro Healthcare',
      type: 'text',
    },
  ];

  for (const review of reviews) {
    const existing = await db.review.findFirst({ where: { studentName: review.studentName } });
    if (existing) {
      console.log(`⭐ Review from "${review.studentName}" already exists, skipping...`);
    } else {
      await db.review.create({ data: review });
      console.log(`⭐ Review from "${review.studentName}" created`);
    }
  }

  // ============ 4. FACULTY MEMBERS ============
  const facultyMembers = [
    {
      name: 'Dr. Sanjay Mukherjee',
      designation: 'Senior Medical Coding Trainer',
      qualification: 'M.Sc in Healthcare Administration, CPC, CPC-I Certified',
      experience: '12+ years in medical coding training and healthcare revenue cycle management',
      specialization: 'ICD-10-CM/PCS, CPT Coding, HCPCS Level II, CPC Exam Preparation',
      photoUrl: '/images/faculty/faculty-1.jpg',
    },
    {
      name: 'Priya Banerjee',
      designation: 'Lead Coding Instructor',
      qualification: 'B.Pharm, CPC, CCS Certified, AHIMA Member',
      experience: '8+ years in medical coding with expertise in specialty-specific coding and denial management',
      specialization: 'Denial Coding Management, Specialty Coding, E/M Coding, Compliance Auditing',
      photoUrl: '/images/faculty/faculty-2.jpg',
    },
    {
      name: 'Anirudh Dasgupta',
      designation: 'Medical Coding Faculty',
      qualification: 'M.Sc in Biotechnology, CPC, COC Certified',
      experience: '6+ years in outpatient and ambulatory surgical center coding',
      specialization: 'Outpatient Coding, Ambulatory Payment Classifications, HCPCS, Anatomy & Physiology',
      photoUrl: '/images/faculty/faculty-3.jpg',
    },
  ];

  for (const faculty of facultyMembers) {
    const existing = await db.faculty.findFirst({ where: { name: faculty.name } });
    if (existing) {
      console.log(`👨‍🏫 Faculty "${faculty.name}" already exists, skipping...`);
    } else {
      await db.faculty.create({ data: faculty });
      console.log(`👨‍🏫 Faculty "${faculty.name}" created`);
    }
  }

  // ============ 5. COURSES ============
  const courses = [
    {
      title: 'Advanced Diploma in Medical Coding',
      slug: 'advanced-diploma-in-medical-coding',
      description: 'Comprehensive diploma program covering ICD-10-CM, CPT, and HCPCS Level II coding systems. Includes extensive hands-on practice with real medical records, anatomy & physiology foundation, and CPC exam preparation. Ideal for freshers looking to build a career in medical coding.',
      price: 45000,
      duration: '6 months',
      level: 'beginner',
      status: 'published',
      thumbnail: '/images/courses/advanced-diploma.jpg',
    },
    {
      title: 'Specialized Coding Courses',
      slug: 'specialized-coding-courses',
      description: 'Advanced specialization courses for experienced coders focusing on specialty-specific coding including cardiology, orthopedics, radiology, and anesthesia coding. Enhance your expertise and increase your career opportunities in niche medical coding domains.',
      price: 25000,
      duration: '3 months',
      level: 'advanced',
      status: 'published',
      thumbnail: '/images/courses/specialized-coding.jpg',
    },
    {
      title: 'Denial Coding Management',
      slug: 'denial-coding-management',
      description: 'Master the art of denial management and revenue cycle optimization. Learn to analyze claim denials, apply correct coding modifications, understand payer-specific guidelines, and improve first-pass claim acceptance rates. Essential for mid-level coders looking to advance their careers.',
      price: 20000,
      duration: '2 months',
      level: 'intermediate',
      status: 'published',
      thumbnail: '/images/courses/denial-coding.jpg',
    },
    {
      title: 'Specialization-Based Training',
      slug: 'specialization-based-training',
      description: 'Choose your specialization track — Inpatient Coding, Outpatient Coding, Surgical Coding, or Professional Fee Coding. Each track provides in-depth training with real-world case studies and mentorship from industry experts to prepare you for specialized coding roles.',
      price: 30000,
      duration: '4 months',
      level: 'intermediate',
      status: 'published',
      thumbnail: '/images/courses/specialization-training.jpg',
    },
    {
      title: 'CPC Exam Preparation',
      slug: 'cpc-exam-preparation',
      description: 'Intensive CPC (Certified Professional Coder) exam preparation course. Includes comprehensive study material, timed mock exams, coding practice from actual exam patterns, and proven strategies to pass the AAPC CPC exam on your first attempt. Covers all exam sections with special focus on high-weightage areas.',
      price: 15000,
      duration: '2 months',
      level: 'beginner',
      status: 'published',
      thumbnail: '/images/courses/cpc-exam-prep.jpg',
    },
  ];

  for (const course of courses) {
    const existing = await db.course.findUnique({ where: { slug: course.slug } });
    if (existing) {
      console.log(`📚 Course "${course.title}" already exists, skipping...`);
    } else {
      await db.course.create({ data: course });
      console.log(`📚 Course "${course.title}" created`);
    }
  }

  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
