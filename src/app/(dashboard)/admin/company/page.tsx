'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import api from '@/lib/api'

export default function AdminCompanyPage() {
  const { data: session, update } = useSession()
  const company = (session?.user as any)?.company

  const [branding, setBranding] = useState({
    primary_color:   company?.branding?.primary_color   ?? '#2E75B6',
    secondary_color: company?.branding?.secondary_color ?? '#2C3E50',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const saveBranding = async () => {
    setSaving(true); setMsg('')
    try {
      await api.put('/admin/company/branding', branding)
      setMsg('Branding saved. Refresh the page to see changes.')
      setTimeout(() => setMsg(''), 4000)
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? 'Failed to save.')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company profile and branding</p>
      </div>

      {/* Company Details */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Company Name</p>
            <p className="font-medium text-gray-900 mt-0.5">{company?.name ?? 'ATCC Platform'}</p>
          </div>
          <div>
            <p className="text-gray-500">Knowledge Version</p>
            <p className="font-medium text-gray-900 mt-0.5">{company?.knowledge_version ?? 'v5'}</p>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Branding</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set your company colours. These will be applied across the platform for all users in your company.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.primary_color}
                  onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primary_color}
                  onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#2E75B6"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.secondary_color}
                  onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondary_color}
                  onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value }))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#2C3E50"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-32 rounded-lg" style={{ backgroundColor: branding.primary_color }} />
              <div className="h-8 w-32 rounded-lg" style={{ backgroundColor: branding.secondary_color }} />
              <button
                style={{ backgroundColor: branding.primary_color, color: 'white' }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
              >
                Button Preview
              </button>
            </div>
          </div>

          {msg && (
            <p className={`text-sm rounded-lg px-3 py-2 ${msg.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {msg}
            </p>
          )}

          <button
            onClick={saveBranding}
            disabled={saving}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </div>
    </div>
  )
}
