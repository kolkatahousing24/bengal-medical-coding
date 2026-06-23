'use client'

import { useState, useEffect } from 'react'
import { Hash, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function StudentBlog() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/blogs?status=published')
      .then(r => r.json())
      .then(d => d.success && setBlogs(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = blogs.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.hashtags?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Blog</h2>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input placeholder="Search blogs or hashtags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-zinc-900 border-zinc-800" />
      </div>
      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          filtered.length === 0 ? <p className="text-zinc-500">No blog posts found</p> :
          filtered.map(b => (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">{b.title}</h3>
              <p className="text-sm text-zinc-400 mb-3">{b.description}</p>
              {b.hashtags && (
                <div className="flex flex-wrap gap-2">
                  {(typeof b.hashtags === 'string' ? JSON.parse(b.hashtags || '[]') : b.hashtags).map((tag: string, i: number) => (
                    <span key={i} className="text-xs text-[#c8882a] bg-[#c8882a]/10 px-2 py-0.5 rounded-full cursor-pointer" onClick={() => setSearch(tag.replace('#', ''))}>
                      <Hash className="h-3 w-3 inline" />{tag.replace('#', '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
