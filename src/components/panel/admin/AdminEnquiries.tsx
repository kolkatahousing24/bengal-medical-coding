'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Phone, Mail, GraduationCap, Calendar, Search, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Enquiry {
  id: string
  fullName: string
  mobile: string
  email: string
  qualification: string | null
  message: string | null
  source: string
  createdAt: string
}

interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  message: string
  createdAt: string
}

const sourceConfig: Record<string, { label: string; color: string }> = {
  'enquiry': { label: 'Enquiry', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'contact': { label: 'Contact', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'demo-class': { label: 'Demo Class', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'enquiries' | 'contacts'>('enquiries')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/enquiry').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
    ])
      .then(([eqData, ctData]) => {
        if (!cancelled) {
          if (eqData.success) setEnquiries(eqData.data || [])
          if (ctData.success) setContacts(ctData.data || [])
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/enquiry').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
    ])
      .then(([eqData, ctData]) => {
        if (eqData.success) setEnquiries(eqData.data || [])
        if (ctData.success) setContacts(ctData.data || [])
      })
      .finally(() => setLoading(false))
  }

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return
    try {
      const res = await fetch(`/api/enquiry?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Enquiry deleted')
        setEnquiries(prev => prev.filter(e => e.id !== id))
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Delete this contact message?')) return
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Contact message deleted')
        setContacts(prev => prev.filter(c => c.id !== id))
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.mobile?.includes(search)
    const matchesFilter = activeFilter === 'all' || e.source === activeFilter
    return matchesSearch && matchesFilter
  })

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const totalEnquiries = enquiries.length
  const totalContacts = contacts.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Form Submissions</h2>
        <p className="text-sm text-zinc-400">All enquiry, contact & demo class form submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{totalEnquiries}</p>
          <p className="text-xs text-zinc-400">Total Enquiries</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{enquiries.filter(e => e.source === 'demo-class').length}</p>
          <p className="text-xs text-zinc-400">Demo Class Requests</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">{enquiries.filter(e => e.source === 'enquiry').length}</p>
          <p className="text-xs text-zinc-400">Enquiry Forms</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-400">{totalContacts}</p>
          <p className="text-xs text-zinc-400">Contact Messages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'enquiries'
              ? 'text-white border-[#7b1a10]'
              : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-1.5" />
          Enquiries ({totalEnquiries})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contacts'
              ? 'text-white border-[#7b1a10]'
              : 'text-zinc-400 border-transparent hover:text-white'
          }`}
        >
          <Phone className="h-4 w-4 inline mr-1.5" />
          Contacts ({totalContacts})
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
        {activeTab === 'enquiries' && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            {['all', 'enquiry', 'contact', 'demo-class'].map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? 'bg-[#7b1a10] hover:bg-[#9b2a18] text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'}
              >
                {filter === 'all' ? 'All' : sourceConfig[filter]?.label || filter}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800" />
                <div className="flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-32 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'enquiries' ? (
        filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No enquiries found</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredEnquiries.map((eq) => {
              const src = sourceConfig[eq.source] || sourceConfig['enquiry']
              return (
                <div key={eq.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-[#7b1a10]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#c8882a] font-bold text-sm">
                          {eq.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-white text-sm">{eq.fullName}</p>
                          <Badge className={`${src.color} text-[10px]`}>{src.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${eq.mobile}`} className="hover:text-white transition-colors">{eq.mobile}</a>
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${eq.email}`} className="hover:text-white transition-colors truncate">{eq.email}</a>
                          </span>
                          {eq.qualification && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {eq.qualification}
                            </span>
                          )}
                        </div>
                        {eq.message && (
                          <p className="text-xs text-zinc-500 mt-2 bg-zinc-800/50 rounded p-2 line-clamp-2">{eq.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {new Date(eq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEnquiry(eq.id)}
                        className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No contact messages found</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredContacts.map((ct) => (
              <div key={ct.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0">
                      <span className="text-purple-400 font-bold text-sm">
                        {ct.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{ct.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${ct.phone}`} className="hover:text-white transition-colors">{ct.phone}</a>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${ct.email}`} className="hover:text-white transition-colors truncate">{ct.email}</a>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 bg-zinc-800/50 rounded p-2 line-clamp-2">{ct.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {new Date(ct.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(ct.id)}
                      className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
