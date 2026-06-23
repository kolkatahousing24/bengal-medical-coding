'use client'

import { useState, useEffect, useRef } from 'react'
import { ImagePlus, Trash2, ImageIcon, Loader2 } from 'lucide-react'
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
import { toast } from 'sonner'

const CATEGORIES = ['classroom', 'workshop', 'events', 'placement', 'campus'] as const

interface GalleryImage {
  id: string
  title: string
  category: string
  description?: string
  imageUrl?: string
  createdAt?: string
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setImages(d.data || [])
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load gallery images')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshImages = () => {
    setLoading(true)
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => d.success && setImages(d.data || []))
      .catch(() => toast.error('Failed to refresh gallery'))
      .finally(() => setLoading(false))
  }

  const handleUpload = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.category) {
      toast.error('Please select a category')
      return
    }
    if (!selectedFile) {
      toast.error('Please select an image file')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title.trim())
      formData.append('category', form.category)
      formData.append('description', form.description.trim())
      formData.append('file', selectedFile)

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Image uploaded successfully!')
        setForm({ title: '', category: '', description: '' })
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        refreshImages()
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image from the gallery?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Image deleted successfully')
        refreshImages()
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  const categoryLabel = (cat: string) =>
    cat.charAt(0).toUpperCase() + cat.slice(1)

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'classroom':
        return 'bg-blue-500/20 text-blue-400'
      case 'workshop':
        return 'bg-amber-500/20 text-amber-400'
      case 'events':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'placement':
        return 'bg-purple-500/20 text-purple-400'
      case 'campus':
        return 'bg-rose-500/20 text-rose-400'
      default:
        return 'bg-zinc-700 text-zinc-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gallery Management</h2>
          <p className="text-sm text-zinc-400">
            {images.length} image{images.length !== 1 ? 's' : ''} in gallery
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <ImagePlus className="h-5 w-5 text-[#c8882a]" />
          <h3 className="text-white font-semibold text-lg">Upload New Image</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Title *</Label>
            <Input
              placeholder="Enter image title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm">Description</Label>
          <Textarea
            placeholder="Add a description for this image (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm">Image File *</Label>
          <div className="flex items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="bg-zinc-800 border-zinc-700 text-white file:bg-zinc-700 file:text-white file:border-0 file:rounded-md file:mr-3 file:px-3 file:py-1 file:text-sm file:cursor-pointer"
            />
          </div>
          {selectedFile && (
            <p className="text-xs text-zinc-400">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={submitting}
          className="w-full md:w-auto bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] hover:from-[#9b2a18] hover:to-[#7b1a10] text-white font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-zinc-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No images in gallery</p>
          <p className="text-sm">Upload your first image using the form above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group"
            >
              {/* Image Preview */}
              <div className="h-40 bg-zinc-800 relative overflow-hidden">
                {img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-10 w-10 text-zinc-600" />
                  </div>
                )}
                {/* Delete overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                    className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm"
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2">
                <h3 className="text-white font-medium text-sm truncate">
                  {img.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${categoryColor(img.category)}`}
                  >
                    {categoryLabel(img.category)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                    className="h-7 px-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                {img.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {img.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
