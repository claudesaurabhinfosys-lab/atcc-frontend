'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Company {
  id: number
  name: string
  slug: string
  is_active: boolean
  users_count?: number
  assessments_count?: number
}

interface Analytics {
  total_companies: number
  total_assessments: number
  total_users: number
  risk_modules: number
}

export default function SuperAdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [newCompany, setNewCompany] = useState({ name: '', slug: '' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  const roles = (session?.user as any)?.roles ?? []
  const isSuperAdmin = roles.some((r: any) => (typeof r === 'string' ? r : r?.name) === 'super_admin')

  useEffect(() => {
    if (!isSuperAdmin) { router.push('/dashboard'); return }
    Promise.all([
      api.get('/super-admin/companies'),
      api.get('/super-admin/analytics'),
    ]).then(([cRes, aRes]) => {
      setCompanies(cRes.data?.data ?? cRes.data ?? [])
      setAnalytics(aRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isSuperAdmin])

  const createCompany = async () => {
    if (!newCompany.name || !newCompany.slug) return
    setCreating(true)
    try {
      const res = await api.post('/super-admin/companies', newCompany)
      setCompanies(c => [res.data, ...c])
      setNewCompany({ name: '', slug: '' })
      setMsg('Company created successfully.')
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? 'Failed to create company.')
    } finally { setCreating(false) }
  }

  const toggleActive = async (company: Company) => {
    try {
      await api.put(`/super-admin/companies/${company.id}`, { is_active: !company.is_active })
      setCompanies(cs => cs.map(c => c.id === company.id ? { ...c, is_active: !c.is_active } : c))
    } catch { }
  }

  if (!isSuperAdmin) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide management — companies, users, knowledge</p>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Companies', value: analytics.total_companies },
            { label: 'Total Users', value: analytics.total_users },
            { label: 'Total Assessments', value: analytics.total_assessments },
            { label: 'Risk Modules', value: analytics.risk_modules },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{msg}</div>}

      {/* Create Company */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Create New Company</h2>
        <div className="flex gap-3">
          <input value={newCompany.name} onChange={e => setNewCompany(s => ({ ...s, name: e.target.value }))}
            placeholder="Company name" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input value={newCompany.slug} onChange={e => setNewCompany(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/\s+/g,'-') }))}
            placeholder="slug (unique)" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={createCompany} disabled={creating || !newCompany.name || !newCompany.slug}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">All Companies ({companies.length})</h2>
        </div>
        {loading ? (
          <p className="p-8 text-center text-gray-400 text-sm">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No companies yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Users</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Assessments</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{c.users_count ?? 0}</td>
                  <td className="px-5 py-3 text-gray-600">{c.assessments_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.is_active ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(c)} className="text-xs text-primary hover:underline">
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
