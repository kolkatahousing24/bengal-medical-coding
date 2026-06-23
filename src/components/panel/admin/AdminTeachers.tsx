'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Ban, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: 'teacher123', designation: 'Instructor', qualification: '', specialization: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/users?role=teacher')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setTeachers(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshTeachers = () => {
    setLoading(true)
    fetch('/api/users?role=teacher')
      .then(r => r.json())
      .then(d => d.success && setTeachers(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields (Name, Email, Password)')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'teacher' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Teacher account created successfully!')
        setDialogOpen(false)
        setForm({ name: '', email: '', mobile: '', password: 'teacher123', designation: 'Instructor', qualification: '', specialization: '' })
        refreshTeachers()
      } else {
        toast.error(data.error || 'Failed to create teacher')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Teacher deleted successfully')
        refreshTeachers()
      } else {
        toast.error(data.error || 'Failed to delete teacher')
      }
    } catch {
      toast.error('Failed to delete teacher')
    }
  }

  const handleSuspend = async (id: string, status: string) => {
    const newStatus = status === 'active' ? 'suspended' : 'active'
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Teacher ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`)
        refreshTeachers()
      } else {
        toast.error(data.error || 'Failed to update teacher status')
      }
    } catch {
      toast.error('Failed to update teacher status')
    }
  }

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Teacher Management</h2>
          <p className="text-sm text-zinc-400">{teachers.length} teachers registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
              <Plus className="h-4 w-4 mr-2" />Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Create Teacher Account</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Mobile" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Password *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : 'Create Teacher'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-zinc-900 border-zinc-800" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Email</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Designation</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No teachers found</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4 text-sm text-white font-medium">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{t.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{t.designation || t.teacherProfile?.designation || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} text-xs`}>
                        {t.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleSuspend(t.id, t.status)} className="h-8 w-8 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10" title={t.status === 'active' ? 'Suspend' : 'Activate'}>
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
