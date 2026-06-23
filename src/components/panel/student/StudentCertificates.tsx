'use client'

import { useState, useEffect } from 'react'
import { Award, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(d => d.success && setCertificates(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          certificates.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <Award className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No certificates yet</p>
              <p className="text-xs text-zinc-600 mt-1">Complete a course to earn your certificate</p>
            </div>
          ) :
          certificates.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-600/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{c.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{c.type === 'completion' ? 'Completion Certificate' : 'Achievement Certificate'} • Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                  <Download className="h-4 w-4 mr-1" />Download
                </Button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
