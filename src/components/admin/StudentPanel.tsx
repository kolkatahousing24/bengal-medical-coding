'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GraduationCap,
  Loader2,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// ===== TYPES =====
interface StudentProfile {
  id: string
  name: string
  email: string
  mobile: string | null
  enrollmentNo: string
  admissionDate: string
  status: string
}

interface DashboardStats {
  enrolledCourses: number
  attendanceRate: number
  avgScore: number
  certificates: number
}

interface StudentNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface EnrolledCourse {
  id: string
  title: string
  level: string
  duration: string | null
  progress: number
  status: string
  enrolledAt: string
}

interface AttendanceRecord {
  id: string
  date: string
  status: string
  duration: number
  joinTime: string | null
  leaveTime: string | null
  liveClassTitle: string | null
}

interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  rate: number
}

interface ExamResultRecord {
  id: string
  title: string
  type: string
  score: number
  totalMarks: number
  percentage: number
  status: string
  submittedAt: string
}

type StudentTab = 'dashboard' | 'courses' | 'attendance' | 'exams' | 'notifications'

const studentTabs: { value: StudentTab; label: string; icon: typeof GraduationCap }[] = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'courses', label: 'My Courses', icon: BookOpen },
  { value: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { value: 'exams', label: 'Exam Results', icon: BarChart3 },
  { value: 'notifications', label: 'Notifications', icon: Bell },
]

interface StudentPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

// ===== STAT CARD COMPONENT =====
function StudentStatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: typeof GraduationCap
  label: string
  value: string | number
  suffix?: string
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-blue-100 dark:bg-blue-800/40', iconText: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', iconBg: 'bg-green-100 dark:bg-green-800/40', iconText: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', iconBg: 'bg-purple-100 dark:bg-purple-800/40', iconText: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', iconBg: 'bg-amber-100 dark:bg-amber-800/40', iconText: 'text-amber-600 dark:text-amber-400' },
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
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${c.iconText}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ===== MAIN COMPONENT =====
export default function StudentPanel({ open, onOpenChange, userId }: StudentPanelProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard')
  const [loading, setLoading] = useState(false)

  // Dashboard state
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentNotifications, setRecentNotifications] = useState<StudentNotification[]>([])

  // Courses state
  const [courses, setCourses] = useState<EnrolledCourse[]>([])

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)

  // Exams state
  const [examResults, setExamResults] = useState<ExamResultRecord[]>([])

  // Notifications state
  const [notifications, setNotifications] = useState<StudentNotification[]>([])

  // Lock body scroll when panel is open
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

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`/api/student/profile?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
          setDashboardStats(data.stats)
          setRecentNotifications(data.recentNotifications || [])
        }
      } else if (activeTab === 'courses') {
        const res = await fetch(`/api/student/courses?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setCourses(data.courses || [])
        }
      } else if (activeTab === 'attendance') {
        const res = await fetch(`/api/student/attendance?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setAttendanceRecords(data.records || [])
          setAttendanceSummary(data.summary || null)
        }
      } else if (activeTab === 'exams') {
        const res = await fetch(`/api/student/exams?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setExamResults(data.results || [])
        }
      } else if (activeTab === 'notifications') {
        const res = await fetch(`/api/student/notifications?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [activeTab, userId])

  useEffect(() => {
    if (open && userId) fetchData()
  }, [open, activeTab, fetchData, userId])

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
        setRecentNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
      }
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Format time helper
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get status icon for attendance
  const getAttendanceStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'late':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  // Get status badge for attendance
  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Present
          </Badge>
        )
      case 'absent':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Absent
          </Badge>
        )
      case 'late':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Late
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get notification type icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <BarChart3 className="h-4 w-4 text-purple-500" />
      case 'class':
        return <CalendarCheck className="h-4 w-4 text-blue-500" />
      case 'assignment':
        return <BookOpen className="h-4 w-4 text-amber-500" />
      case 'announcement':
        return <Bell className="h-4 w-4 text-green-500" />
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get level badge color
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Beginner
          </Badge>
        )
      case 'intermediate':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Intermediate
          </Badge>
        )
      case 'advanced':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Advanced
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0">{level}</Badge>
    }
  }

  // Get course status badge
  const getCourseStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            In Progress
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Completed
          </Badge>
        )
      case 'dropped':
        return (
          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Dropped
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0">{status}</Badge>
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateStr)
  }

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
            {/* Student Header */}
            <div className="bg-gradient-to-r from-medical-dark to-medical-blue px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base sm:text-lg font-heading">
                    {profile ? `Welcome, ${profile.name.split(' ')[0]}!` : 'Student Dashboard'}
                  </h2>
                  <p className="text-white/70 text-xs">
                    {profile ? `Enrollment: ${profile.enrollmentNo}` : 'Your learning portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close student panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border bg-muted/30">
              {studentTabs.map((tab) => {
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
                    {tab.value === 'notifications' && recentNotifications.filter((n) => !n.isRead).length > 0 && (
                      <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                        {recentNotifications.filter((n) => !n.isRead).length}
                      </span>
                    )}
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
                        {/* Profile Card */}
                        {profile && (
                          <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0">
                                <span className="text-medical-blue dark:text-medical-cyan font-bold text-lg">
                                  {getInitials(profile.name)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-lg truncate">{profile.name}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {profile.email}
                                  </span>
                                  {profile.mobile && (
                                    <span className="flex items-center gap-1">
                                      {profile.mobile}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="text-[9px] px-1.5 py-0 border-0 bg-medical-blue/10 text-medical-blue dark:bg-medical-cyan/10 dark:text-medical-cyan">
                                    {profile.enrollmentNo}
                                  </Badge>
                                  <Badge
                                    className={`text-[9px] px-1.5 py-0 border-0 ${
                                      profile.status === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : profile.status === 'completed'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                                  >
                                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stats Grid */}
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">Your Progress</h3>
                        </div>
                        {dashboardStats ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <StudentStatCard
                              icon={BookOpen}
                              label="Enrolled Courses"
                              value={dashboardStats.enrolledCourses}
                              color="blue"
                            />
                            <StudentStatCard
                              icon={CalendarCheck}
                              label="Attendance Rate"
                              value={dashboardStats.attendanceRate}
                              suffix="%"
                              color="green"
                            />
                            <StudentStatCard
                              icon={BarChart3}
                              label="Avg Score"
                              value={dashboardStats.avgScore}
                              suffix="%"
                              color="purple"
                            />
                            <StudentStatCard
                              icon={Award}
                              label="Certificates"
                              value={dashboardStats.certificates}
                              color="amber"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <StudentStatCard icon={BookOpen} label="Enrolled Courses" value={0} color="blue" />
                            <StudentStatCard icon={CalendarCheck} label="Attendance Rate" value={0} suffix="%" color="green" />
                            <StudentStatCard icon={BarChart3} label="Avg Score" value={0} suffix="%" color="purple" />
                            <StudentStatCard icon={Award} label="Certificates" value={0} color="amber" />
                          </div>
                        )}

                        {/* Recent Notifications */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              <Bell className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                              Recent Notifications
                            </h3>
                            {recentNotifications.length > 0 && (
                              <button
                                onClick={() => setActiveTab('notifications')}
                                className="text-xs text-medical-blue dark:text-medical-cyan hover:underline cursor-pointer"
                              >
                                View All
                              </button>
                            )}
                          </div>
                          {recentNotifications.length === 0 ? (
                            <div className="bg-card rounded-xl border border-border p-6 text-center">
                              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-muted-foreground text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {recentNotifications.slice(0, 5).map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`flex items-start gap-3 p-3 bg-card rounded-lg border border-border ${
                                    !notif.isRead ? 'border-l-4 border-l-medical-blue dark:border-l-medical-cyan' : ''
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {notif.title}
                                      </p>
                                      {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-medical-blue dark:bg-medical-cyan shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.message}</p>
                                    <span className="text-[10px] text-muted-foreground mt-1 block">
                                      {getRelativeTime(notif.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===== MY COURSES TAB ===== */}
                    {activeTab === 'courses' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">My Courses ({courses.length})</h3>
                        </div>

                        {courses.length === 0 ? (
                          <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No courses enrolled yet</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              Contact your administrator to get enrolled in a course.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {courses.map((course) => (
                              <div
                                key={course.id}
                                className="bg-card rounded-xl border border-border p-4 sm:p-5"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <BookOpen className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-foreground text-sm truncate">{course.title}</p>
                                      {getLevelBadge(course.level)}
                                      {getCourseStatusBadge(course.status)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                      {course.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {course.duration}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <CalendarCheck className="h-3 w-3" />
                                        Enrolled {formatDate(course.enrolledAt)}
                                      </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted-foreground">Progress</span>
                                        <span className="text-xs font-medium text-medical-blue dark:text-medical-cyan">
                                          {Math.round(course.progress)}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={course.progress}
                                        className="h-2"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== ATTENDANCE TAB ===== */}
                    {activeTab === 'attendance' && (
                      <div className="space-y-6">
                        {/* Attendance Summary */}
                        {attendanceSummary && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <StudentStatCard
                              icon={CalendarCheck}
                              label="Total Classes"
                              value={attendanceSummary.total}
                              color="blue"
                            />
                            <StudentStatCard
                              icon={CheckCircle2}
                              label="Present"
                              value={attendanceSummary.present}
                              color="green"
                            />
                            <StudentStatCard
                              icon={XCircle}
                              label="Absent"
                              value={attendanceSummary.absent}
                              color="amber"
                            />
                            <StudentStatCard
                              icon={TrendingUp}
                              label="Attendance Rate"
                              value={attendanceSummary.rate}
                              suffix="%"
                              color="purple"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <CalendarCheck className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">
                            Attendance Records ({attendanceRecords.length})
                          </h3>
                        </div>

                        {attendanceRecords.length === 0 ? (
                          <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No attendance records yet</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              Attendance records will appear here once available.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {attendanceRecords.map((record) => (
                              <div
                                key={record.id}
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                              >
                                <div className="shrink-0">{getAttendanceStatusIcon(record.status)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-foreground text-sm">
                                      {record.liveClassTitle || formatDate(record.date)}
                                    </p>
                                    {getAttendanceStatusBadge(record.status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <CalendarCheck className="h-3 w-3" />
                                      {formatDate(record.date)}
                                    </span>
                                    {record.joinTime && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(record.joinTime)} - {formatTime(record.leaveTime)}
                                      </span>
                                    )}
                                    {record.duration > 0 && (
                                      <span>{record.duration} min</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== EXAM RESULTS TAB ===== */}
                    {activeTab === 'exams' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">
                            Exam Results ({examResults.length})
                          </h3>
                        </div>

                        {examResults.length === 0 ? (
                          <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No exam results yet</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              Your exam results will appear here once available.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {examResults.map((result) => (
                              <div
                                key={result.id}
                                className="bg-card rounded-xl border border-border p-4 sm:p-5"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                      result.status === 'pass'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-red-100 dark:bg-red-900/30'
                                    }`}
                                  >
                                    {result.status === 'pass' ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-foreground text-sm truncate">{result.title}</p>
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                        {result.type}
                                      </Badge>
                                      <Badge
                                        className={`text-[9px] px-1.5 py-0 border-0 ${
                                          result.status === 'pass'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                      >
                                        {result.status === 'pass' ? 'Passed' : 'Failed'}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                      <div className="text-center">
                                        <p className="text-lg font-bold text-foreground">{result.score}</p>
                                        <p className="text-[10px] text-muted-foreground">Score</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-lg font-bold text-foreground">{result.totalMarks}</p>
                                        <p className="text-[10px] text-muted-foreground">Total</p>
                                      </div>
                                      <div className="text-center">
                                        <p
                                          className={`text-lg font-bold ${
                                            result.percentage >= 50
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          {Math.round(result.percentage)}%
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Percentage</p>
                                      </div>
                                      <div className="ml-auto text-xs text-muted-foreground">
                                        {formatDate(result.submittedAt)}
                                      </div>
                                    </div>
                                    {/* Score progress bar */}
                                    <div className="mt-2">
                                      <Progress
                                        value={result.percentage}
                                        className={`h-1.5 ${
                                          result.percentage >= 50
                                            ? '[&>div]:bg-green-500 dark:[&>div]:bg-green-400'
                                            : '[&>div]:bg-red-500 dark:[&>div]:bg-red-400'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== NOTIFICATIONS TAB ===== */}
                    {activeTab === 'notifications' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            <h3 className="font-semibold text-foreground">
                              Notifications ({notifications.length})
                            </h3>
                          </div>
                          {notifications.some((n) => !n.isRead) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-medical-blue dark:text-medical-cyan hover:text-medical-blue/80 dark:hover:text-medical-cyan/80 cursor-pointer"
                              onClick={() => {
                                notifications
                                  .filter((n) => !n.isRead)
                                  .forEach((n) => handleMarkAsRead(n.id))
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Mark all as read
                            </Button>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No notifications</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              You&apos;re all caught up! Notifications will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`bg-card rounded-lg border border-border p-3 sm:p-4 transition-colors ${
                                  !notif.isRead
                                    ? 'border-l-4 border-l-medical-blue dark:border-l-medical-cyan bg-medical-blue/5 dark:bg-medical-cyan/5'
                                    : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p
                                        className={`text-sm font-medium truncate ${
                                          !notif.isRead ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                      >
                                        {notif.title}
                                      </p>
                                      {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-medical-blue dark:bg-medical-cyan shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-[10px] text-muted-foreground">
                                        {getRelativeTime(notif.createdAt)}
                                      </span>
                                      {!notif.isRead && (
                                        <button
                                          onClick={() => handleMarkAsRead(notif.id)}
                                          className="text-[10px] text-medical-blue dark:text-medical-cyan hover:underline cursor-pointer"
                                        >
                                          Mark as read
                                        </button>
                                      )}
                                    </div>
                                  </div>
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
