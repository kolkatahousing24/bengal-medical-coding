'use client'

import { useState, useEffect } from 'react'
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/live-classes')
      .then(r => r.json())
      .then(d => d.success && setClasses(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff <= 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Live Classes</h2>
      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          classes.length === 0 ? <p className="text-zinc-500">No classes scheduled</p> :
          classes.map(c => {
            const countdown = getCountdown(c.date)
            const isLive = !countdown && c.status === 'scheduled' && new Date(c.date).getTime() + c.duration * 60000 > Date.now()
            return (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
                      <Video className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{c.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                        <span><Calendar className="h-3.5 w-3.5 inline mr-1" />{new Date(c.date).toLocaleDateString()}</span>
                        <span><Clock className="h-3.5 w-3.5 inline mr-1" />{c.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isLive ? (
                      <a href={c.meetingLink || '#'} target="_blank" rel="noopener noreferrer">
                        <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2">
                          <Video className="h-4 w-4" /> Join Now
                        </button>
                      </a>
                    ) : countdown ? (
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">Starts in</p>
                        <p className="text-sm font-bold text-amber-400">{countdown}</p>
                      </div>
                    ) : (
                      <Badge className="bg-zinc-700 text-zinc-300 text-xs">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
