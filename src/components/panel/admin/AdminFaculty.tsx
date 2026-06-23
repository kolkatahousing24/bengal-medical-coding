'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Faculty {
  id: string
  name: string
  designation: string
  qualification: string
  specialization: string
  experience: string
  photo?: string
}

const designationOptions = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'HOD',
  'Dean',
  'Lecturer',
  'Senior Lecturer',
  'Visiting Faculty',
]

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    designation: '',
    qualification: '',
    experience: '',
    specialization: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/faculty')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setFaculty(d.data || [])
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load faculty')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshFaculty = () => {
    setLoading(true)
    fetch('/api/faculty')
      .then((r) => r.json())
      .then((d) => d.success && setFaculty(d.data || []))
      .catch(() => toast.error('Failed to refresh faculty'))
      .finally(() => setLoading(false))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      designation: '',
      qualification: '',
      experience: '',
      specialization: '',
    })
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCreate = async () => {
    if (!form.name || !form.designation || !form.qualification) {
      toast.error('Please fill in all required fields (Name, Designation, Qualification)')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('designation', form.designation)
      formData.append('qualification', form.qualification)
      formData.append('experience', form.experience)
      formData.append('specialization', form.specialization)
      if (photo) formData.append('photo', photo)

      const res = await fetch('/api/faculty', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Faculty member added successfully!')
        setDialogOpen(false)
        resetForm()
        refreshFaculty()
      } else {
        toast.error(data.error || 'Failed to add faculty member')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this faculty member?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Faculty member deleted successfully')
        refreshFaculty()
      } else {
        toast.error(data.error || 'Failed to delete faculty member')
      }
    } catch {
      toast.error('Failed to delete faculty member')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Faculty Management</h2>
          <p className="text-sm text-zinc-400">{faculty.length} faculty members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] hover:from-[#9b2a18] hover:to-[#7b1a10] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Faculty Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Name *</Label>
                <Input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Designation *</Label>
                <Select
                  value={form.designation}
                  onValueChange={(value) =>
                    setForm({ ...form, designation: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {designationOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Qualification *</Label>
                <Input
                  placeholder="e.g. Ph.D, M.Tech, MBA"
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({ ...form, qualification: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Experience</Label>
                <Input
                  placeholder="e.g. 10 years"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Specialization</Label>
                <Input
                  placeholder="e.g. Machine Learning, Data Science"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm({ ...form, specialization: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Photo</Label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="bg-zinc-800 border-zinc-700 text-white file:bg-zinc-700 file:text-zinc-300 file:border-0 file:rounded-md file:mr-3 file:px-3 file:py-1 file:text-sm file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] hover:from-[#9b2a18] hover:to-[#7b1a10] text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  'Add Faculty Member'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : faculty.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <p>No faculty members yet. Add your first faculty member!</p>
          </div>
        ) : (
          faculty.map((f) => (
            <div
              key={f.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              {/* Top: Photo + Name + Designation */}
              <div className="flex items-start gap-4 mb-4">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                  {f.photo ? (
                    <img
                      src={f.photo}
                      alt={f.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-zinc-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{f.name}</h3>
                  <p className="text-sm text-[#c8882a] font-medium">
                    {f.designation}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(f.id)}
                  disabled={deletingId === f.id}
                  className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                  title="Delete"
                >
                  {deletingId === f.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {f.qualification && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Qualification:</span>
                    <span className="text-zinc-300">{f.qualification}</span>
                  </div>
                )}
                {f.specialization && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Specialization:</span>
                    <span className="text-zinc-300">{f.specialization}</span>
                  </div>
                )}
                {f.experience && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Experience:</span>
                    <span className="text-zinc-300">{f.experience}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
