'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ShieldCheck, UserCog, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LoginType = 'student' | 'teacher' | 'admin'

const loginTypes: { value: LoginType; label: string; icon: typeof GraduationCap; color: string; features: string[] }[] = [
  {
    value: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'bg-medical-blue',
    features: ['View Notes', 'Track Attendance', 'Submit Assignments', 'Download Certificates'],
  },
  {
    value: 'teacher',
    label: 'Teacher',
    icon: UserCog,
    color: 'bg-accent-red',
    features: ['Upload Notes', 'Manage Attendance', 'Student Records', 'Assign Homework'],
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'bg-accent-gold',
    features: ['Manage Gallery Images', 'Manage Faculty', 'Add Reviews', 'View Enquiries'],
  },
]

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<LoginType>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ id: '', password: '' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { setUser } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.id, password: credentials.password }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setIsLoggingIn(false)
        setLoginError(data.error || 'Invalid email or password')
        return
      }

      // Check role matches the selected tab
      const userRole = data.user?.role
      if (activeTab === 'admin' && userRole !== 'admin') {
        setIsLoggingIn(false)
        setLoginError('This account does not have admin access. Please use the correct login tab.')
        return
      }
      if (activeTab === 'teacher' && userRole !== 'teacher') {
        setIsLoggingIn(false)
        setLoginError('This account does not have teacher access. Please use the correct login tab.')
        return
      }
      if (activeTab === 'student' && userRole !== 'student') {
        setIsLoggingIn(false)
        setLoginError('This account does not have student access. Please use the correct login tab.')
        return
      }

      // Success - set user in store (which also opens the panel)
      setIsLoggingIn(false)
      const roleLabels: Record<string, string> = { admin: 'Admin', teacher: 'Teacher', student: data.user.name }
      toast.success(`Welcome, ${roleLabels[userRole] || data.user.name}!`, {
        description: `You have successfully logged in to the ${userRole} panel.`,
      })
      onOpenChange(false)
      setCredentials({ id: '', password: '' })

      // Set user in Zustand store - this automatically opens the panel
      setTimeout(() => {
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
          profilePhoto: data.user.profilePhoto || null,
        })
      }, 300)
    } catch {
      setIsLoggingIn(false)
      setLoginError('Network error. Please try again.')
    }
  }

  const currentType = loginTypes.find((t) => t.value === activeTab)!
  const CurrentIcon = currentType.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Login Portal</DialogTitle>
          <DialogDescription>
            Choose your login type and enter your credentials
          </DialogDescription>
        </DialogHeader>

        {/* Branding Header */}
        <div className="bg-medical-blue px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/images/logo.jpg"
                alt="Logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-heading">The Bengal Medical</span>
              <span className="text-[10px] font-medium text-white/80">Coding Training Academy</span>
              <span className="text-[7px] font-bold text-accent-gold tracking-wide uppercase">West Bengal&apos;s First Medical Coding Institute</span>
            </div>
          </div>
        </div>

        {/* Login Type Tabs */}
        <div className="flex border-b border-border">
          {loginTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => { setActiveTab(type.value); setLoginError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === type.value
                    ? 'text-medical-blue dark:text-medical-cyan border-b-2 border-medical-blue dark:border-medical-cyan bg-medical-blue/5 dark:bg-medical-cyan/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${currentType.color} flex items-center justify-center`}>
                  <CurrentIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
                    {currentType.label} Login
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Access your {currentType.label.toLowerCase()} dashboard
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id">
                    Email
                  </Label>
                  <Input
                    id="login-id"
                    placeholder="Enter email address"
                    value={credentials.id}
                    onChange={(e) =>
                      setCredentials({ ...credentials, id: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-xs"
                  >
                    {loginError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`w-full ${currentType.color} text-white rounded-xl shadow-md`}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login as {currentType.label}
                    </>
                  )}
                </Button>
              </form>

              {/* Features */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Features available:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentType.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-medical-blue dark:bg-medical-cyan" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Forgot your credentials?{' '}
                <a href="#" className="text-medical-blue dark:text-medical-cyan hover:underline">
                  Contact Admin
                </a>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
