'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, User, MessageSquare, Loader2, Clock } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  message: string
  createdAt: string
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/contact')
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.success) {
          setContacts(data.data || [])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-6 bg-zinc-800 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-72 animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-[#c8882a] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Contact Messages</h2>
        <p className="text-sm text-zinc-400">All contact form submissions from your website</p>
      </div>

      {/* Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#c8882a]/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-[#c8882a]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{contacts.length}</p>
            <p className="text-sm text-zinc-400">Total Messages</p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      {contacts.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No contact messages yet</p>
          <p className="text-xs text-zinc-600 mt-1">Messages will appear here when visitors submit the contact form</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[65vh] overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-[#c8882a]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#c8882a] font-bold text-sm">
                    {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <p className="font-medium text-white text-sm">{contact.name}</p>

                  {/* Contact Details */}
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#c8882a]" />
                      <a href={`tel:${contact.phone}`} className="hover:text-white transition-colors">
                        {contact.phone}
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-[#c8882a]" />
                      <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors truncate">
                        {contact.email}
                      </a>
                    </span>
                  </div>

                  {/* Message */}
                  <div className="mt-3 bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="h-3 w-3 text-[#c8882a]" />
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Message</span>
                    </div>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                  </div>
                </div>

                {/* Date */}
                <span className="text-[10px] text-zinc-600 flex items-center gap-1 whitespace-nowrap shrink-0 pt-0.5">
                  <Clock className="h-3 w-3 text-[#c8882a]" />
                  {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
