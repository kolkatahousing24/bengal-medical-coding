'use client'

import { useState, useEffect } from 'react'
import { Plus, PenTool, Trash2, Hash, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', description: '', content: '', hashtags: '', tags: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setBlogs(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshBlogs = () => {
    setLoading(true)
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => d.success && setBlogs(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.title) {
      toast.error('Blog title is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Blog post created successfully!')
        setDialogOpen(false)
        setForm({ title: '', slug: '', description: '', content: '', hashtags: '', tags: '' })
        refreshBlogs()
      } else {
        toast.error(data.error || 'Failed to create blog')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Blog deleted successfully')
        refreshBlogs()
      } else {
        toast.error(data.error || 'Failed to delete blog')
      }
    } catch {
      toast.error('Failed to delete blog')
    }
  }

  const parseHashtags = (hashtags: any) => {
    try {
      if (typeof hashtags === 'string') return JSON.parse(hashtags || '[]')
      if (Array.isArray(hashtags)) return hashtags
      return []
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Blog Management</h2>
          <p className="text-sm text-zinc-400">{blogs.length} blog posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Create Blog</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Blog Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Slug URL" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Short Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <textarea placeholder="Blog Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm" />
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Hashtags (comma separated, e.g. #MedicalCoding, #CPC)" value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : 'Publish Blog'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse"><div className="h-6 bg-zinc-800 rounded w-1/2 mb-3" /><div className="h-4 bg-zinc-800 rounded w-3/4" /></div>)
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No blog posts yet. Create your first post!</div>
        ) : blogs.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{b.title}</h3>
                  <Badge className={`${b.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>{b.status}</Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-3">{b.description || 'No description'}</p>
                {b.hashtags && (
                  <div className="flex flex-wrap gap-1">
                    {parseHashtags(b.hashtags).map((tag: string, i: number) => (
                      <span key={i} className="text-xs text-[#c8882a] bg-[#c8882a]/10 px-2 py-0.5 rounded-full">
                        <Hash className="h-3 w-3 inline" />{tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-zinc-400 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
