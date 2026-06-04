'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import api from '@/lib/api'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(''); setError('')
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.put('/auth/password', { current_password: currentPassword, password: newPassword, password_confirmation: confirm })
      setMessage('Password updated successfully.')
      setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900 mt-0.5">{(session?.user as any)?.name ?? '—'}</p></div>
          <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900 mt-0.5">{session?.user?.email ?? '—'}</p></div>
          <div><p className="text-gray-500">Role</p><p className="font-medium text-gray-900 mt-0.5 capitalize">{(() => { const r = (session?.user as any)?.roles?.[0]; return r ? (typeof r === 'string' ? r : r?.name ?? '—').replace(/_/g,' ') : '—' })()}</p></div>
          <div><p className="text-gray-500">Company</p><p className="font-medium text-gray-900 mt-0.5">{(session?.user as any)?.company?.name ?? 'Platform Admin'}</p></div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
            { label: 'New Password', value: newPassword, setter: setNewPassword },
            { label: 'Confirm New Password', value: confirm, setter: setConfirm },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={value} onChange={e => setter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button type="submit" disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
