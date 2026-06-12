'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'

interface ScopeType {
  id: number
  value: string
  label: string
  description: string | null
  is_active: boolean
  sort_order: number
}

const emptyForm = { value: '', label: '', description: '', sort_order: 0 }

export default function ScopeTypesPage() {
  const [items, setItems] = useState<ScopeType[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/super-admin/scope-types')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (st: ScopeType) => {
    setEditId(st.id)
    setForm({ value: st.value, label: st.label, description: st.description ?? '', sort_order: st.sort_order })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.value.trim() || !form.label.trim()) { setError('Value and Label are required.'); return }
    if (!/^[a-z0-9_]+$/.test(form.value)) { setError('Value must be lowercase letters, numbers and underscores only.'); return }
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/super-admin/scope-types/${editId}`, form)
      } else {
        await api.post('/super-admin/scope-types', form)
      }
      setShowForm(false)
      load()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.errors?.value?.[0] || 'Save failed.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (st: ScopeType) => {
    await api.put(`/super-admin/scope-types/${st.id}`, { ...st, is_active: !st.is_active })
    load()
  }

  const handleDelete = async (st: ScopeType) => {
    if (!confirm(`Delete scope type "${st.label}"? This cannot be undone.`)) return
    await api.delete(`/super-admin/scope-types/${st.id}`)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scope Types</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the scope type options available in the assessment wizard dropdown.
            Changes apply to all companies immediately.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> Add Scope Type
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">{editId ? 'Edit Scope Type' : 'New Scope Type'}</h2>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value <span className="text-red-500">*</span></label>
              <input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                placeholder="e.g. remote_site"
                disabled={!!editId}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Lowercase, underscores only. Cannot change after creation.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display Label <span className="text-red-500">*</span></label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Remote Site"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional — appears as tooltip in the dropdown"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the dropdown.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No scope types yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Order</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Active</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(st => (
                <tr key={st.id} className={`hover:bg-gray-50 transition ${!st.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-gray-300">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{st.value}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{st.label}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">{st.description ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{st.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(st)} title={st.is_active ? 'Deactivate' : 'Activate'}>
                      {st.is_active
                        ? <ToggleRight size={20} className="text-green-500" />
                        : <ToggleLeft size={20} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(st)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(st)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Active scope types appear in the assessment wizard dropdown for all users across all companies.
        Inactive types are hidden from the dropdown but existing assessments are unaffected.
      </p>
    </div>
  )
}
