'use client'

import { useState } from 'react'
import { User, Lock, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function StudentProfile() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [mobile, setMobile] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleUpdateProfile = async () => {
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile }),
    })
    const d = await res.json()
    setMessage(d.success ? '✅ Profile updated!' : '❌ ' + d.error)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleChangePassword = async () => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const d = await res.json()
    setMessage(d.success ? '✅ Password changed!' : '❌ ' + d.error)
    setCurrentPassword('')
    setNewPassword('')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">My Profile</h2>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-zinc-700">
            <AvatarImage src={user?.profilePhoto || ''} />
            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-2xl">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
            <p className="text-sm text-zinc-400">{user?.email}</p>
            <Badge className="bg-[#c8882a]/20 text-[#c8882a] text-xs capitalize mt-1">{user?.role}</Badge>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Update Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-zinc-800 border-zinc-700" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Mobile Number</label>
            <Input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98765 43210" className="bg-zinc-800 border-zinc-700" />
          </div>
          <Button onClick={handleUpdateProfile} className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Save Changes</Button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Current Password</label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-zinc-800 border-zinc-700" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">New Password</label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-zinc-800 border-zinc-700" />
          </div>
          <Button onClick={handleChangePassword} className="bg-[#c8882a] hover:bg-[#b57825] text-white">Change Password</Button>
        </div>
      </div>
    </div>
  )
}
