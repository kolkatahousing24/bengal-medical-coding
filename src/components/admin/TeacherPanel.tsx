'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  BookOpen,
  Users,
  ClipboardList,
  Bell,
  LayoutDashboard,
  Loader2,
  Search,
  Clock,
  Mail,
  Calendar,
  Plus,
  GraduationCap,
  Video,
  CheckCircle2,
  Circle,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeacherProfile {
  id: string
  name: string
  email: string
  designation: string
  specialization: string | null
  qualification: string | null
  experience: string | null
  profilePhoto: string | null
}

interface DashboardStats {
  myCourses: number
  totalStudents: number
  liveClasses: number
  assignments: number
}

interface TeacherCourse {
  id: string
  title: string
  level: string
  status: string
  duration: string | null
  studentCount: number
}

interface TeacherStudent {
  id: string
  name: string
  email: string
  enrollmentNo: string
  course: string
  status: string
}

interface TeacherAssignment {
  id: string
  title: string
  course: string | null
  deadline: string | null
  submissions: number
  status: string
  maxMarks: number
}

interface TeacherNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

type TeacherTab = 'dashboard' | 'courses' | 'students' | 'assignments' | 'notifications'

const teacherTabs: { value: TeacherTab; label: string; icon: typeof BookOpen }[] = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'courses', label: 'My Courses', icon: BookOpen },
  { value: 'students', label: 'Students', icon: Users },
  { value: 'assignments', label: 'Assignments', icon: ClipboardList },
  { value: 'notifications', label: 'Notifications', icon: Bell },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────

function TeacherStatCard({
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
    red: { bg: 'bg-red-50 dark:bg-red-900/20', iconBg: 'bg-red-100 dark:bg-red-800/40', iconText: 'text-red-600 dark:text-red-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-blue-100 dark:bg-blue-800/40', iconText: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', iconBg: 'bg-green-100 dark:bg-green-800/40', iconText: 'text-green-600 dark:text-green-400' },
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface TeacherPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeacherPanel({ open, onOpenChange, userId }: TeacherPanelProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard')
  const [loading, setLoading] = useState(false)

  // Dashboard state
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentNotifications, setRecentNotifications] = useState<TeacherNotification[]>([])

  // Courses state
  const [courses, setCourses] = useState<TeacherCourse[]>([])

  // Students state
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [studentSearch, setStudentSearch] = useState('')

  // Assignments state
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    courseId: '',
    deadline: '',
    maxMarks: '100',
  })
  const [addingAssignment, setAddingAssignment] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState<TeacherNotification[]>([])

  // ─── Fetch data based on tab ──────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        const [profileRes, notifRes] = await Promise.all([
          fetch(`/api/teacher/profile?userId=${userId}`),
          fetch(`/api/teacher/notifications?userId=${userId}`),
        ])
        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data.profile)
          setDashboardStats(data.stats)
        }
        if (notifRes.ok) {
          const data = await notifRes.json()
          setRecentNotifications(data.slice(0, 5))
        }
      } else if (activeTab === 'courses') {
        const res = await fetch(`/api/teacher/courses?userId=${userId}`)
        if (res.ok) setCourses(await res.json())
      } else if (activeTab === 'students') {
        const searchParam = studentSearch ? `&search=${encodeURIComponent(studentSearch)}` : ''
        const res = await fetch(`/api/teacher/students?userId=${userId}${searchParam}`)
        if (res.ok) setStudents(await res.json())
      } else if (activeTab === 'assignments') {
        const res = await fetch(`/api/teacher/assignments?userId=${userId}`)
        if (res.ok) setAssignments(await res.json())
      } else if (activeTab === 'notifications') {
        const res = await fetch(`/api/teacher/notifications?userId=${userId}`)
        if (res.ok) setNotifications(await res.json())
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [activeTab, userId, studentSearch])

  useEffect(() => {
    if (open) fetchData()
  }, [open, activeTab, fetchData])

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

  // Reset search when switching tabs
  useEffect(() => {
    setStudentSearch('')
  }, [activeTab])

  // ─── Assignment handler ───────────────────────────────────────────────────

  const handleAssignmentAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingAssignment(true)
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: assignmentForm.title,
          courseId: assignmentForm.courseId || null,
          deadline: assignmentForm.deadline || null,
          maxMarks: parseFloat(assignmentForm.maxMarks) || 100,
        }),
      })
      if (res.ok) {
        toast.success('Assignment created successfully!')
        setAssignmentForm({ title: '', courseId: '', deadline: '', maxMarks: '100' })
        setShowAssignmentForm(false)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create assignment')
      }
    } catch {
      toast.error('Failed to create assignment')
    } finally {
      setAddingAssignment(false)
    }
  }

  // ─── Mark notification as read ────────────────────────────────────────────

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const res = await fetch(`/api/teacher/notifications?id=${notifId}&userId=${userId}`, { method: 'PATCH' })
      if (res.ok) fetchData()
    } catch {
      toast.error('Failed to update notification')
    }
  }

  // ─── Render helpers ──────────────────────────────────────────────────────

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      dropped: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return map[status] || map.draft
  }

  const getNotifTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return <Video className="h-4 w-4" />
      case 'assignment': return <ClipboardList className="h-4 w-4" />
      case 'exam': return <GraduationCap className="h-4 w-4" />
      case 'alert': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotifTypeBg = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'assignment': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
      case 'exam': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

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
            {/* Teacher Header */}
            <div className="bg-gradient-to-r from-accent-red to-medical-dark px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base sm:text-lg font-heading">Teacher Dashboard</h2>
                  <p className="text-white/70 text-xs">
                    {profile ? `Welcome, ${profile.name}` : 'Loading...'}
                  </p>
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
              {teacherTabs.map((tab) => {
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
                    {tab.value === 'notifications' && recentNotifications.filter(n => !n.isRead).length > 0 && (
                      <span className="ml-1 w-4 h-4 rounded-full bg-accent-red text-white text-[9px] flex items-center justify-center">
                        {recentNotifications.filter(n => !n.isRead).length}
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
                        {/* Welcome Section */}
                        <Card className="border-border">
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-red to-medical-dark flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-lg">
                                  {profile?.name
                                    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                                    : 'TC'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground text-lg">
                                  Welcome back, {profile?.name || 'Teacher'}!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {profile?.designation || 'Instructor'}
                                  {profile?.specialization ? ` • ${profile.specialization}` : ''}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3" />
                                  {profile?.email || ''}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">Overview</h3>
                        </div>
                        {dashboardStats ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <TeacherStatCard icon={BookOpen} label="My Courses" value={dashboardStats.myCourses} color="red" />
                            <TeacherStatCard icon={Users} label="Total Students" value={dashboardStats.totalStudents} color="blue" />
                            <TeacherStatCard icon={Video} label="Live Classes" value={dashboardStats.liveClasses} color="green" />
                            <TeacherStatCard icon={ClipboardList} label="Assignments" value={dashboardStats.assignments} color="amber" />
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">Failed to load stats.</p>
                        )}

                        {/* Recent Notifications */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            Recent Notifications
                          </h3>
                          {recentNotifications.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6 text-sm">No recent notifications.</p>
                          ) : (
                            <div className="space-y-2">
                              {recentNotifications.map((n) => (
                                <div
                                  key={n.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-colors ${
                                    n.isRead ? 'bg-card' : 'bg-accent-red/5 dark:bg-accent-red/10'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getNotifTypeBg(n.type)}`}>
                                    {getNotifTypeIcon(n.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${n.isRead ? 'text-foreground' : 'font-semibold text-foreground'}`}>
                                      {n.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <Clock className="h-3 w-3" />
                                      {formatDateTime(n.createdAt)}
                                    </span>
                                  </div>
                                  {!n.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-accent-red shrink-0 mt-1.5" />
                                  )}
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
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">My Assigned Courses ({courses.length})</h3>
                        </div>
                        {courses.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No courses assigned yet</p>
                            <p className="text-muted-foreground text-xs mt-1">Courses will appear here once assigned by admin.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {courses.map((c) => (
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
                                    <Badge className={`text-[9px] px-1.5 py-0 border-0 ${getStatusBadge(c.status)}`}>
                                      {c.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                      {c.level}
                                    </Badge>
                                    {c.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {c.duration}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {c.studentCount} students
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== STUDENTS TAB ===== */}
                    {activeTab === 'students' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">My Students ({students.length})</h3>
                        </div>

                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search students by name or email..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>

                        {students.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                              <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">
                              No students found{studentSearch ? ' matching your search' : ''}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                              Students enrolled in your courses will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {students.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                              >
                                <div className="w-10 h-10 rounded-full bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0">
                                  <span className="text-medical-blue dark:text-medical-cyan font-bold text-sm">
                                    {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground text-sm truncate">{s.name}</p>
                                    <Badge className={`text-[9px] px-1.5 py-0 border-0 ${getStatusBadge(s.status)}`}>
                                      {s.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {s.email}
                                    </span>
                                    <span className="text-medical-blue dark:text-medical-cyan">
                                      {s.enrollmentNo}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      {s.course}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ===== ASSIGNMENTS TAB ===== */}
                    {activeTab === 'assignments' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                            <h3 className="font-semibold text-foreground">Assignments ({assignments.length})</h3>
                          </div>
                          <Button
                            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                            size="sm"
                            className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            New Assignment
                          </Button>
                        </div>

                        {/* Add Assignment Form */}
                        <AnimatePresence>
                          {showAssignmentForm && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card className="border-border">
                                <CardContent className="pt-0">
                                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                                    Create New Assignment
                                  </h4>
                                  <form onSubmit={handleAssignmentAdd} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Assignment Title *</Label>
                                        <Input
                                          placeholder="e.g., CPC Chapter 4 Exercises"
                                          value={assignmentForm.title}
                                          onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Course</Label>
                                        <Select
                                          value={assignmentForm.courseId}
                                          onValueChange={(v) => setAssignmentForm({ ...assignmentForm, courseId: v })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {courses.map((c) => (
                                              <SelectItem key={c.id} value={c.id}>
                                                {c.title}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Input
                                          type="date"
                                          value={assignmentForm.deadline}
                                          onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Max Marks</Label>
                                        <Input
                                          type="number"
                                          placeholder="100"
                                          value={assignmentForm.maxMarks}
                                          onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: e.target.value })}
                                          min="1"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="submit"
                                        disabled={addingAssignment}
                                        className="bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue"
                                      >
                                        {addingAssignment ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Assignment
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAssignmentForm(false)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </form>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Assignments List */}
                        {assignments.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                              <ClipboardList className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No assignments created yet</p>
                            <p className="text-muted-foreground text-xs mt-1">Click &quot;New Assignment&quot; to create one.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {assignments.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                              >
                                <div className="w-10 h-10 rounded-lg bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center shrink-0">
                                  <ClipboardList className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground text-sm truncate">{a.title}</p>
                                    <Badge className={`text-[9px] px-1.5 py-0 border-0 ${getStatusBadge(a.status)}`}>
                                      {a.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                    {a.course && (
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        {a.course}
                                      </span>
                                    )}
                                    {a.deadline && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due {formatDate(a.deadline)}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {a.submissions} submissions
                                    </span>
                                    <span className="flex items-center gap-1">
                                      Max: {a.maxMarks} marks
                                    </span>
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
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-medical-blue dark:text-medical-cyan" />
                          <h3 className="font-semibold text-foreground">
                            Notifications ({notifications.length})
                          </h3>
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <Badge className="text-[9px] px-1.5 py-0 border-0 bg-accent-red text-white">
                              {notifications.filter(n => !n.isRead).length} unread
                            </Badge>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                              <Bell className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No notifications</p>
                            <p className="text-muted-foreground text-xs mt-1">You&apos;re all caught up!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-colors ${
                                  n.isRead ? 'bg-card' : 'bg-accent-red/5 dark:bg-accent-red/10'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getNotifTypeBg(n.type)}`}>
                                  {getNotifTypeIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm ${n.isRead ? 'text-foreground' : 'font-semibold text-foreground'}`}>
                                      {n.title}
                                    </p>
                                    {n.isRead ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    ) : (
                                      <Circle className="h-3.5 w-3.5 text-accent-red shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDateTime(n.createdAt)}
                                    </span>
                                    {!n.isRead && (
                                      <button
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="text-[10px] text-medical-blue dark:text-medical-cyan hover:underline cursor-pointer"
                                      >
                                        Mark as read
                                      </button>
                                    )}
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
