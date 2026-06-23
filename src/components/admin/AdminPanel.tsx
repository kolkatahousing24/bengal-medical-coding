'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Trash2,
  ImagePlus,
  Plus,
  Users,
  MessageSquare,
  Star,
  ImageIcon,
  GraduationCap,
  Loader2,
  Phone,
  Mail,
  Calendar,
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Search,
  DollarSign,
  Clock,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Types
interface GalleryImage {
  id: string
  title: string
  category: string
  imageUrl: string
  description: string | null
  createdAt: string
}

interface FacultyMember {
  id: string
  name: string
  designation: string
  qualification: string
  experience: string
  specialization: string
  photoUrl: string | null
  createdAt: string
}

interface Review {
  id: string
  studentName: string
  reviewText: string
  rating: number
  course: string | null
  placement: string | null
  type: string
  createdAt: string
}

interface Enquiry {
  id: string
  fullName: string
  mobile: string
  email: string
  qualification: string | null
  message: string | null
  source: string
  createdAt: string
}

interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  message: string
  createdAt: string
}

interface UserRecord {
  id: string
  email: string
  name: string
  role: string
  mobile: string | null
  status: string
  createdAt: string
  studentProfile: { enrollmentNo: string; courseIds: string } | null
  teacherProfile: { designation: string; specialization: string } | null
}

interface CourseRecord {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  duration: string | null
  level: string
  status: string
  createdAt: string
}

interface DashboardStats {
  students: number
  teachers: number
  courses: number
  enquiries: number
  galleryImages: number
  reviews: number
  contacts: number
  faculties: number
}

type AdminTab = 'dashboard' | 'students' | 'teachers' | 'courses' | 'gallery' | 'faculty' | 'reviews' | 'enquiries' | 'contacts'

const adminTabs: { value: AdminTab; label: string; icon: typeof ImageIcon }[] = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'students', label: 'Students', icon: Users },
  { value: 'teachers', label: 'Teachers', icon: UserCheck },
  { value: 'courses', label: 'Courses', icon: BookOpen },
  { value: 'gallery', label: 'Gallery', icon: ImageIcon },
  { value: 'faculty', label: 'Faculty', icon: GraduationCap },
  { value: 'reviews', label: 'Reviews', icon: Star },
  { value: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { value: 'contacts', label: 'Contacts', icon: Phone },
]

const galleryCategories = ['classroom', 'workshop', 'events', 'placement', 'campus']

interface AdminPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [loading, setLoading] = useState(false)

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  // Users state
  const [students, setStudents] = useState<UserRecord[]>([])
  const [teachers, setTeachers] = useState<UserRecord[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', mobile: '' })
  const [addingUser, setAddingUser] = useState(false)

  // Courses state
  const [coursesList, setCoursesList] = useState<CourseRecord[]>([])
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    price: '',
  })
  const [addingCourse, setAddingCourse] = useState(false)

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryForm, setGalleryForm] = useState({ title: '', category: 'classroom', description: '' })
  const [galleryFile, setGalleryFile] = useState<File | null>(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Faculty state
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([])
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    designation: '',
    qualification: '',
    experience: '',
    specialization: '',
  })
  const [facultyFile, setFacultyFile] = useState<File | null>(null)
  const [uploadingFaculty, setUploadingFaculty] = useState(false)

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([])
  const [reviewForm, setReviewForm] = useState({
    studentName: '',
    reviewText: '',
    rating: 5,
    course: '',
    placement: '',
  })
  const [addingReview, setAddingReview] = useState(false)

  // Enquiries & Contacts
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [contacts, setContacts] = useState<ContactMessage[]>([])

  const galleryFileRef = useRef<HTMLInputElement>(null)
  const facultyFileRef = useRef<HTMLInputElement>(null)

  // Fetch data based on tab
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/dashboard')
        if (res.ok) setDashboardStats(await res.json())
      } else if (activeTab === 'students') {
        const searchParam = userSearch ? `&search=${encodeURIComponent(userSearch)}` : ''
        const res = await fetch(`/api/users?role=student${searchParam}`)
        if (res.ok) setStudents(await res.json())
      } else if (activeTab === 'teachers') {
        const searchParam = userSearch ? `&search=${encodeURIComponent(userSearch)}` : ''
        const res = await fetch(`/api/users?role=teacher${searchParam}`)
        if (res.ok) setTeachers(await res.json())
      } else if (activeTab === 'courses') {
        const res = await fetch('/api/courses?all=true')
        if (res.ok) {
          const data = await res.json()
          setCoursesList(data.data || [])
        }
      } else if (activeTab === 'gallery') {
        const res = await fetch('/api/gallery')
        if (res.ok) setGalleryImages(await res.json())
      } else if (activeTab === 'faculty') {
        const res = await fetch('/api/faculty')
        if (res.ok) setFacultyList(await res.json())
      } else if (activeTab === 'reviews') {
        const res = await fetch('/api/reviews')
        if (res.ok) setReviewsList(await res.json())
      } else if (activeTab === 'enquiries') {
        const res = await fetch('/api/enquiry')
        if (res.ok) setEnquiries(await res.json())
      } else if (activeTab === 'contacts') {
        const res = await fetch('/api/contact')
        if (res.ok) setContacts(await res.json())
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [activeTab, userSearch])

  useEffect(() => {
    if (open) fetchData()
  }, [open, activeTab, fetchData])

  // Lock body scroll when admin panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Reset search when switching user tabs
  useEffect(() => {
    setUserSearch('')
  }, [activeTab])

  // ===== USER HANDLERS =====
  const handleUserAdd = async (e: React.FormEvent, role: 'student' | 'teacher') => {
    e.preventDefault()
    setAddingUser(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm, role }),
      })
      if (res.ok) {
        toast.success(`${role === 'student' ? 'Student' : 'Teacher'} added successfully!`)
        setUserForm({ name: '', email: '', password: '', mobile: '' })
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add user')
      }
    } catch {
      toast.error('Failed to add user')
    } finally {
      setAddingUser(false)
    }
  }

  const handleUserDelete = async (id: string, role: string) => {
    if (!confirm(`Are you sure you want to delete this ${role}?`)) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${role === 'student' ? 'Student' : 'Teacher'} deleted`)
        fetchData()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  // ===== COURSE HANDLERS =====
  const handleCourseAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingCourse(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description || null,
          duration: courseForm.duration || null,
          level: courseForm.level,
          price: parseFloat(courseForm.price) || 0,
          status: 'published',
        }),
      })
      if (res.ok) {
        toast.success('Course created successfully!')
        setCourseForm({ title: '', description: '', duration: '', level: 'beginner', price: '' })
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create course')
      }
    } catch {
      toast.error('Failed to create course')
    } finally {
      setAddingCourse(false)
    }
  }

  const handleCourseDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Course deleted')
        fetchData()
      } else {
        toast.error('Failed to delete course')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  // ===== GALLERY HANDLERS =====
  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryFile) {
      toast.error('Please select an image file')
      return
    }
    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('title', galleryForm.title)
      formData.append('category', galleryForm.category)
      formData.append('description', galleryForm.description)
      formData.append('image', galleryFile)

      const res = await fetch('/api/gallery', { method: 'POST', body: formData })
      if (res.ok) {
        toast.success('Image uploaded successfully!')
        setGalleryForm({ title: '', category: 'classroom', description: '' })
        setGalleryFile(null)
        if (galleryFileRef.current) galleryFileRef.current.value = ''
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleGalleryDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Image deleted')
        fetchData()
      } else {
        toast.error('Failed to delete image')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  // ===== FACULTY HANDLERS =====
  const handleFacultyAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingFaculty(true)
    try {
      const formData = new FormData()
      formData.append('name', facultyForm.name)
      formData.append('designation', facultyForm.designation)
      formData.append('qualification', facultyForm.qualification)
      formData.append('experience', facultyForm.experience)
      formData.append('specialization', facultyForm.specialization)
      if (facultyFile) formData.append('photo', facultyFile)

      const res = await fetch('/api/faculty', { method: 'POST', body: formData })
      if (res.ok) {
        toast.success('Faculty member added!')
        setFacultyForm({ name: '', designation: '', qualification: '', experience: '', specialization: '' })
        setFacultyFile(null)
        if (facultyFileRef.current) facultyFileRef.current.value = ''
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add faculty')
      }
    } catch {
      toast.error('Failed to add faculty')
    } finally {
      setUploadingFaculty(false)
    }
  }

  const handleFacultyDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Faculty member deleted')
        fetchData()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  // ===== REVIEW HANDLERS =====
  const handleReviewAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      })
      if (res.ok) {
        toast.success('Review added!')
        setReviewForm({ studentName: '', reviewText: '', rating: 5, course: '', placement: '' })
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add review')
      }
    } catch {
      toast.error('Failed to add review')
    } finally {
      setAddingReview(false)
    }
  }

  const handleReviewDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Review deleted')
        fetchData()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  // ===== SHARED: User list renderer =====
  const renderUserList = (users: UserRecord[], role: 'student' | 'teacher') => (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${role}s by name or email...`}
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No {role}s found{userSearch ? ' matching your search' : ' yet'}.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
            >
              <div className="w-10 h-10 rounded-full bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0">
                <span className="text-medical-blue dark:text-medical-cyan font-bold text-sm">
                  {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm truncate">{u.name}</p>
                  <Badge
                    className={`text-[9px] px-1.5 py-0 border-0 ${
                      u.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {u.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {u.email}
                  </span>
                  {u.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {u.mobile}
                    </span>
                  )}
                  {role === 'student' && u.studentProfile && (
                    <span className="text-medical-blue dark:text-medical-cyan">
                      {u.studentProfile.enrollmentNo}
                    </span>
                  )}
                  {role === 'teacher' && u.teacherProfile && (
                    <span>{u.teacherProfile.designation}</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => handleUserDelete(u.id, role)}
                className="shrink-0 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors cursor-pointer"
                aria-label={`Delete ${role}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ===== SHARED: User add form renderer =====
  const renderUserAddForm = (role: 'student' | 'teacher') => (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
        Add {role === 'student' ? 'Student' : 'Teacher'}
      </h3>
      <form onSubmit={(e) => handleUserAdd(e, role)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              placeholder={role === 'student' ? 'Rahul Kumar' : 'Dr. Priya Sharma'}
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder={role === 'student' ? 'rahul@example.com' : 'priya@example.com'}
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input
              type="password"
              placeholder="Min 6 characters"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile (optional)</Label>
            <Input
              placeholder="+91 98765 43210"
              value={userForm.mobile}
              onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={addingUser}
          className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
        >
          {addingUser ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add {role === 'student' ? 'Student' : 'Teacher'}
            </>
          )}
        </Button>
      </form>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 pb-4 px-2 sm:px-4 overflow-y-auto"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl bg-background rounded-2xl border border-border shadow-2xl overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-medical-dark to-medical-blue px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base sm:text-lg font-heading">Admin Dashboard</h2>
                  <p className="text-white/70 text-xs">Manage your website content</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border bg-muted/30">
              {adminTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                      activeTab === tab.value
                        ? 'text-medical-blue dark:text-medical-cyan border-medical-blue dark:border-medical-cyan bg-medical-blue/5 dark:bg-medical-cyan/5'
                        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-medical-blue dark:text-medical-cyan" />
                  <span className="ml-3 text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* ===== DASHBOARD TAB ===== */}
                    {activeTab === 'dashboard' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">Overview</h3>
                        </div>
                        {dashboardStats ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <StatCard icon={Users} label="Students" value={dashboardStats.students} color="blue" />
                            <StatCard icon={UserCheck} label="Teachers" value={dashboardStats.teachers} color="green" />
                            <StatCard icon={BookOpen} label="Courses" value={dashboardStats.courses} color="purple" />
                            <StatCard icon={MessageSquare} label="Enquiries" value={dashboardStats.enquiries} color="amber" />
                            <StatCard icon={ImageIcon} label="Gallery" value={dashboardStats.galleryImages} color="pink" />
                            <StatCard icon={Star} label="Reviews" value={dashboardStats.reviews} color="yellow" />
                            <StatCard icon={Phone} label="Contacts" value={dashboardStats.contacts} color="teal" />
                            <StatCard icon={GraduationCap} label="Faculty" value={dashboardStats.faculties} color="indigo" />
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">Failed to load stats.</p>
                        )}
                      </div>
                    )}

                    {/* ===== STUDENTS TAB ===== */}
                    {activeTab === 'students' && (
                      <div className="space-y-6">
                        {renderUserAddForm('student')}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Users className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Students ({students.length})
                          </h3>
                          {renderUserList(students, 'student')}
                        </div>
                      </div>
                    )}

                    {/* ===== TEACHERS TAB ===== */}
                    {activeTab === 'teachers' && (
                      <div className="space-y-6">
                        {renderUserAddForm('teacher')}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Teachers ({teachers.length})
                          </h3>
                          {renderUserList(teachers, 'teacher')}
                        </div>
                      </div>
                    )}

                    {/* ===== COURSES TAB ===== */}
                    {activeTab === 'courses' && (
                      <div className="space-y-6">
                        {/* Add Course Form */}
                        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Add New Course
                          </h3>
                          <form onSubmit={handleCourseAdd} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Course Title *</Label>
                                <Input
                                  placeholder="CPC Certification Course"
                                  value={courseForm.title}
                                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input
                                  placeholder="3 months"
                                  value={courseForm.duration}
                                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Level</Label>
                                <Select
                                  value={courseForm.level}
                                  onValueChange={(v) => setCourseForm({ ...courseForm, level: v })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Price (INR)</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={courseForm.price}
                                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                placeholder="Course description..."
                                value={courseForm.description}
                                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={addingCourse}
                              className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                            >
                              {addingCourse ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Course
                                </>
                              )}
                            </Button>
                          </form>
                        </div>

                        {/* Courses List */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Courses ({coursesList.length})
                          </h3>
                          {coursesList.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No courses created yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {coursesList.map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-foreground text-sm truncate">{c.title}</p>
                                      <Badge
                                        className={`text-[9px] px-1.5 py-0 border-0 ${
                                          c.status === 'published'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : c.status === 'archived'
                                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}
                                      >
                                        {c.status}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                      {c.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {c.duration}
                                        </span>
                                      )}
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                        {c.level}
                                      </Badge>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {c.price > 0 ? `₹${c.price.toLocaleString('en-IN')}` : 'Free'}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCourseDelete(c.id)}
                                    className="shrink-0 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Delete course"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===== GALLERY TAB ===== */}
                    {activeTab === 'gallery' && (
                      <div className="space-y-6">
                        {/* Upload Form */}
                        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <ImagePlus className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Upload New Image
                          </h3>
                          <form onSubmit={handleGalleryUpload} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="gallery-title">Image Title *</Label>
                                <Input
                                  id="gallery-title"
                                  placeholder="e.g., Classroom Training Session"
                                  value={galleryForm.title}
                                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gallery-category">Category *</Label>
                                <Select
                                  value={galleryForm.category}
                                  onValueChange={(v) => setGalleryForm({ ...galleryForm, category: v })}
                                >
                                  <SelectTrigger id="gallery-category">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {galleryCategories.map((cat) => (
                                      <SelectItem key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gallery-desc">Description (optional)</Label>
                              <Textarea
                                id="gallery-desc"
                                placeholder="Brief description of the image..."
                                value={galleryForm.description}
                                onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gallery-file">Select Image *</Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  ref={galleryFileRef}
                                  id="gallery-file"
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                                  className="flex-1"
                                />
                                {galleryFile && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {(galleryFile.size / 1024).toFixed(0)} KB
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Accepted: JPEG, PNG, WebP, GIF. Max 5MB.
                              </p>
                            </div>
                            <Button
                              type="submit"
                              disabled={uploadingGallery}
                              className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                            >
                              {uploadingGallery ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </>
                              )}
                            </Button>
                          </form>
                        </div>

                        {/* Gallery Grid */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Gallery Images ({galleryImages.length})
                          </h3>
                          {galleryImages.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                              <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                              <p>No images uploaded yet.</p>
                              <p className="text-sm">Use the form above to upload your first image.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {galleryImages.map((img) => (
                                <div
                                  key={img.id}
                                  className="group relative rounded-lg overflow-hidden border border-border aspect-square"
                                >
                                  <img
                                    src={img.imageUrl}
                                    alt={img.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <p className="text-white text-xs font-medium truncate">{img.title}</p>
                                    <Badge className="text-[9px] w-fit mt-1 bg-medical-blue/80 text-white border-0 px-1.5 py-0">
                                      {img.category}
                                    </Badge>
                                  </div>
                                  <button
                                    onClick={() => handleGalleryDelete(img.id)}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    aria-label="Delete image"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===== FACULTY TAB ===== */}
                    {activeTab === 'faculty' && (
                      <div className="space-y-6">
                        {/* Add Faculty Form */}
                        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Add Faculty Member
                          </h3>
                          <form onSubmit={handleFacultyAdd} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                  placeholder="Dr. John Smith"
                                  value={facultyForm.name}
                                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Designation *</Label>
                                <Input
                                  placeholder="Senior Medical Coding Trainer"
                                  value={facultyForm.designation}
                                  onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Qualification *</Label>
                                <Input
                                  placeholder="M.Sc, CPC Certified"
                                  value={facultyForm.qualification}
                                  onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Experience *</Label>
                                <Input
                                  placeholder="10+ Years"
                                  value={facultyForm.experience}
                                  onChange={(e) => setFacultyForm({ ...facultyForm, experience: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Specialization *</Label>
                              <Input
                                placeholder="ICD-10-CM, CPT Coding"
                                value={facultyForm.specialization}
                                onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Photo (optional)</Label>
                              <Input
                                ref={facultyFileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setFacultyFile(e.target.files?.[0] || null)}
                              />
                              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP. Max 5MB.</p>
                            </div>
                            <Button
                              type="submit"
                              disabled={uploadingFaculty}
                              className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                            >
                              {uploadingFaculty ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Faculty
                                </>
                              )}
                            </Button>
                          </form>
                        </div>

                        {/* Faculty List */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">
                            Faculty Members ({facultyList.length})
                          </h3>
                          {facultyList.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No faculty members added yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {facultyList.map((f) => (
                                <div
                                  key={f.id}
                                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                                >
                                  <div className="w-10 h-10 rounded-full bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
                                    {f.photoUrl ? (
                                      <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-medical-blue dark:text-medical-cyan font-bold text-sm">
                                        {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{f.designation} • {f.specialization}</p>
                                  </div>
                                  <button
                                    onClick={() => handleFacultyDelete(f.id)}
                                    className="shrink-0 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Delete faculty"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===== REVIEWS TAB ===== */}
                    {activeTab === 'reviews' && (
                      <div className="space-y-6">
                        {/* Add Review Form */}
                        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Star className="h-5 w-5 text-accent-gold" />
                            Add Student Review
                          </h3>
                          <form onSubmit={handleReviewAdd} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Student Name *</Label>
                                <Input
                                  placeholder="Riya Sen"
                                  value={reviewForm.studentName}
                                  onChange={(e) => setReviewForm({ ...reviewForm, studentName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Rating *</Label>
                                <Select
                                  value={String(reviewForm.rating)}
                                  onValueChange={(v) => setReviewForm({ ...reviewForm, rating: parseInt(v) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                      <SelectItem key={r} value={String(r)}>
                                        {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r}/5)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Review Text *</Label>
                              <Textarea
                                placeholder="The training was excellent!..."
                                value={reviewForm.reviewText}
                                onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                rows={3}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Course (optional)</Label>
                                <Input
                                  placeholder="CPC Certification"
                                  value={reviewForm.course}
                                  onChange={(e) => setReviewForm({ ...reviewForm, course: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Placement (optional)</Label>
                                <Input
                                  placeholder="Medical Coder at Apollo"
                                  value={reviewForm.placement}
                                  onChange={(e) => setReviewForm({ ...reviewForm, placement: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              disabled={addingReview}
                              className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                            >
                              {addingReview ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Review
                                </>
                              )}
                            </Button>
                          </form>
                        </div>

                        {/* Reviews List */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">
                            Reviews ({reviewsList.length})
                          </h3>
                          {reviewsList.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {reviewsList.map((r) => (
                                <div
                                  key={r.id}
                                  className="p-3 bg-card rounded-lg border border-border"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground text-sm">{r.studentName}</p>
                                        <span className="text-accent-gold text-xs">
                                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{r.reviewText}</p>
                                      {r.placement && (
                                        <p className="text-xs text-medical-blue dark:text-medical-cyan mt-1">
                                          🏢 {r.placement}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleReviewDelete(r.id)}
                                      className="shrink-0 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center cursor-pointer"
                                      aria-label="Delete review"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===== ENQUIRIES TAB ===== */}
                    {activeTab === 'enquiries' && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          Student Enquiries ({enquiries.length})
                        </h3>
                        {enquiries.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No enquiries yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {enquiries.map((eq) => (
                              <div
                                key={eq.id}
                                className="p-3 sm:p-4 bg-card rounded-lg border border-border"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-foreground text-sm">{eq.fullName}</p>
                                      <Badge className={`text-[9px] px-1.5 py-0 border-0 ${
                                        eq.source === 'demo-class' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                        eq.source === 'contact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-medical-green/10 text-medical-green'
                                      }`}>
                                        {eq.source === 'demo-class' ? 'Demo Class' : eq.source === 'contact' ? 'Contact' : 'Enquiry'}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {eq.mobile}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {eq.email}
                                      </span>
                                      {eq.qualification && (
                                        <span className="flex items-center gap-1">
                                          <GraduationCap className="h-3 w-3" />
                                          {eq.qualification}
                                        </span>
                                      )}
                                    </div>
                                    {eq.message && (
                                      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                                        {eq.message}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(eq.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== CONTACTS TAB ===== */}
                    {activeTab === 'contacts' && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Phone className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          Contact Messages ({contacts.length})
                        </h3>
                        {contacts.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No contact messages yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {contacts.map((c) => (
                              <div
                                key={c.id}
                                className="p-3 sm:p-4 bg-card rounded-lg border border-border"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-foreground text-sm">{c.name}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {c.phone}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {c.email}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                                      {c.message}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ===== Stat Card Component =====
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: number
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-blue-100 dark:bg-blue-800/40', iconText: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', iconBg: 'bg-green-100 dark:bg-green-800/40', iconText: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', iconBg: 'bg-purple-100 dark:bg-purple-800/40', iconText: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', iconBg: 'bg-amber-100 dark:bg-amber-800/40', iconText: 'text-amber-600 dark:text-amber-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', iconBg: 'bg-pink-100 dark:bg-pink-800/40', iconText: 'text-pink-600 dark:text-pink-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', iconBg: 'bg-yellow-100 dark:bg-yellow-800/40', iconText: 'text-yellow-600 dark:text-yellow-400' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', iconBg: 'bg-teal-100 dark:bg-teal-800/40', iconText: 'text-teal-600 dark:text-teal-400' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', iconBg: 'bg-indigo-100 dark:bg-indigo-800/40', iconText: 'text-indigo-600 dark:text-indigo-400' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-border p-4 ${c.bg}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${c.iconText}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}
