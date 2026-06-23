'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FileText, Video,
  ClipboardCheck, Award, Bell, LogOut, ChevronRight,
  Settings, PenTool, Calendar, MessageSquare, ImageIcon, Star, Phone,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import AdminDashboard from './admin/AdminDashboard'
import AdminStudents from './admin/AdminStudents'
import AdminTeachers from './admin/AdminTeachers'
import AdminCourses from './admin/AdminCourses'
import AdminBlogs from './admin/AdminBlogs'
import AdminLiveClasses from './admin/AdminLiveClasses'
import AdminExams from './admin/AdminExams'
import AdminAttendance from './admin/AdminAttendance'
import AdminEnquiries from './admin/AdminEnquiries'
import AdminGallery from './admin/AdminGallery'
import AdminFaculty from './admin/AdminFaculty'
import AdminReviews from './admin/AdminReviews'
import AdminContacts from './admin/AdminContacts'
import TeacherDashboard from './teacher/TeacherDashboard'
import TeacherCourses from './teacher/TeacherCourses'
import TeacherLiveClasses from './teacher/TeacherLiveClasses'
import TeacherAssignments from './teacher/TeacherAssignments'
import TeacherExams from './teacher/TeacherExams'
import TeacherBlog from './teacher/TeacherBlog'
import TeacherStudents from './teacher/TeacherStudents'
import StudentDashboard from './student/StudentDashboard'
import StudentCourses from './student/StudentCourses'
import StudentLiveClasses from './student/StudentLiveClasses'
import StudentAssignments from './student/StudentAssignments'
import StudentExams from './student/StudentExams'
import StudentAttendance from './student/StudentAttendance'
import StudentBlog from './student/StudentBlog'
import StudentCertificates from './student/StudentCertificates'
import StudentProfile from './student/StudentProfile'

const adminMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'faculty', label: 'Faculty', icon: GraduationCap },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'live-classes', label: 'Live Classes', icon: Video },
  { id: 'exams', label: 'Examinations', icon: ClipboardCheck },
  { id: 'blogs', label: 'Blog Posts', icon: PenTool },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
]

const teacherMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'live-classes', label: 'Live Classes', icon: Video },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'exams', label: 'Examinations', icon: ClipboardCheck },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'blog', label: 'Blog', icon: PenTool },
]

const studentMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'live-classes', label: 'Live Classes', icon: Video },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'exams', label: 'Examinations', icon: ClipboardCheck },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'blog', label: 'Blog', icon: PenTool },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'profile', label: 'Profile', icon: Settings },
]

export default function PanelContainer() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotif, setShowNotif] = useState(false)

  const role = user?.role || 'student'
  const menu = role === 'admin' ? adminMenu : role === 'teacher' ? teacherMenu : studentMenu

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Block browser back button while panel is open
  useEffect(() => {
    // Push a state so back button doesn't navigate away
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // Push again to prevent back navigation
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    // Block Escape key to prevent any close behavior
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = ''
    }
  }, [])

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?isRead=false`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setNotifications(d.data || [])
          } else if (Array.isArray(d)) {
            setNotifications(d)
          }
        })
        .catch(() => {})
    }
  }, [user])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue with local logout even if API fails
    }
    logout()
  }, [logout])

  const renderContent = () => {
    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />
        case 'students': return <AdminStudents />
        case 'teachers': return <AdminTeachers />
        case 'courses': return <AdminCourses />
        case 'live-classes': return <AdminLiveClasses />
        case 'exams': return <AdminExams />
        case 'blogs': return <AdminBlogs />
        case 'attendance': return <AdminAttendance />
        case 'enquiries': return <AdminEnquiries />
        case 'gallery': return <AdminGallery />
        case 'faculty': return <AdminFaculty />
        case 'reviews': return <AdminReviews />
        case 'contacts': return <AdminContacts />
        default: return <AdminDashboard />
      }
    } else if (role === 'teacher') {
      switch (activeTab) {
        case 'dashboard': return <TeacherDashboard />
        case 'courses': return <TeacherCourses />
        case 'live-classes': return <TeacherLiveClasses />
        case 'assignments': return <TeacherAssignments />
        case 'exams': return <TeacherExams />
        case 'students': return <TeacherStudents />
        case 'blog': return <TeacherBlog />
        default: return <TeacherDashboard />
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard />
        case 'courses': return <StudentCourses />
        case 'live-classes': return <StudentLiveClasses />
        case 'assignments': return <StudentAssignments />
        case 'exams': return <StudentExams />
        case 'attendance': return <StudentAttendance />
        case 'blog': return <StudentBlog />
        case 'certificates': return <StudentCertificates />
        case 'profile': return <StudentProfile />
        default: return <StudentDashboard />
      }
    }
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id)
    // Close sidebar on mobile after nav click
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-950 text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} fixed md:relative z-50 md:z-auto h-full transition-all duration-300 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#7b1a10] to-[#c8882a] flex items-center justify-center text-white font-bold text-sm shrink-0">
            BMC
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate">TBMC TRAINING ACADEMY</h2>
              <p className="text-[9px] text-zinc-500 truncate">The Bengal Medical Coding</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {isActive && sidebarOpen && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
              </button>
            )
          })}
        </nav>

        {/* User Info at Bottom */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-zinc-700">
              <AvatarImage src={user?.profilePhoto || ''} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 capitalize">{role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-3 sm:px-6 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0" aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>
            <h1 className="text-sm sm:text-lg font-semibold text-white capitalize truncate">{menu.find(m => m.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setShowNotif(!showNotif)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              {showNotif && (
                <div className="absolute right-0 top-12 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-zinc-800">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-zinc-500 text-center">No new notifications</p>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Role Badge */}
            <Badge className="hidden sm:inline-flex bg-[#c8882a]/20 text-[#c8882a] border-[#c8882a]/30 text-xs capitalize">{role}</Badge>

            {/* Logout Button - Only way to exit the panel */}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
