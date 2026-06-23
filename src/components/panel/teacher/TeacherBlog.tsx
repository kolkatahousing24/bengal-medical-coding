'use client'

import { useState, useEffect } from 'react'
import { PenTool, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function TeacherBlog() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', description: '', content: '', hashtags: '', tags: '' })

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => d.success && setBlogs(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        status: 'pending_review',
        tags: JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)),
        hashtags: JSON.stringify(form.hashtags.split(',').map(t => t.trim()).filter(Boolean)),
      }),
    })
    setDialogOpen(false)
    setForm({ title: '', slug: '', description: '', content: '', hashtags: '', tags: '' })
    const res = await fetch('/api/blogs')
    const d = await res.json()
    if (d.success) setBlogs(d.data || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Blog Posts</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><PenTool className="h-4 w-4 mr-2" />Write Blog</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader><DialogTitle>Create Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Short Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <textarea placeholder="Content" rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm" />
              <Input placeholder="Hashtags (#MedicalCoding, #CPC)" value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <p className="text-xs text-amber-400">⚠ Requires admin approval before publishing</p>
              <Button onClick={handleCreate} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Submit for Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          blogs.map(b => (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-semibold">{b.title}</h3>
                <Badge className={`${b.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'pending_review' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>{b.status === 'pending_review' ? 'Pending Review' : b.status}</Badge>
              </div>
              <p className="text-sm text-zinc-400">{b.description || 'No description'}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}
