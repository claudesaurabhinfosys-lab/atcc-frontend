'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface User { id: number; full_name: string; email: string; job_title?: string; is_active: boolean; roles: string[] }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.data ?? r.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company users and roles</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
          + Invite User
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{u.full_name}</td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3 text-gray-600 capitalize">{u.roles?.[0]?.replace('_', ' ') ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${u.is_active ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
