'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Plus, Pencil, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'

interface RiskModule {
  id: number
  module_code: string
  name: string
  description: string | null
  category: string | null
  sort_order: number
  is_active: boolean
  scope: string
}

const emptyForm = { module_code: '', name: '', description: '', category: '', sort_order: 0 }

export default function RiskTemplatesPage() {
  const [items, setItems] = useState<RiskModule[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<RiskModule>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/super-admin/global-knowledge')
      .then(r => setItems(Array.isArray(r.data) ? r.data : r.data?.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const startEdit = (m: RiskModule) => {
    setEditId(m.id)
    setEditForm({ name: m.name, description: m.description ?? '', category: m.category ?? '', sort_order: m.sort_order })
    setError('')
  }

  const cancelEdit = () => { setEditId(null); setEditForm({}) }

  const saveEdit = async (m: RiskModule) => {
    if (!editForm.name?.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      await api.put(`/super-admin/global-knowledge/risk-modules/${m.module_code}`, editForm)
      setEditId(null)
      load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Save failed.')
    } finally {
      setSaving(false) }
  }

  const toggleActive = async (m: RiskModule) => {
    await api.put(`/super-admin/global-knowledge/risk-modules/${m.module_code}`, { is_active: !m.is_active })
    load()
  }

  const handleAdd = async () => {
    setError('')
    if (!addForm.module_code.trim() || !addForm.name.trim()) { setError('Module Code and Name are required.'); return }
    if (!/^[A-Z0-9_]+$/.test(addForm.module_code)) { setError('Module Code must be uppercase letters, numbers and underscores only.'); return }
    setSaving(true)
    try {
      await api.post('/super-admin/risk-modules', addForm)
      setShowAdd(false)
      setAddForm(emptyForm)
      load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.errors?.module_code?.[0] ?? 'Create failed.')
    } finally {
      setSaving(false)
    }
  }

  const active   = items.filter(m => m.is_active)
  const inactive = items.filter(m => !m.is_active)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Areas of Risk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the risk template library shown in the assessment wizard.
            Active templates are selectable by all companies. Inactive ones are hidden but existing assessments are unaffected.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError('') }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> Add Area of Risk
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Area of Risk</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Module Code <span className="text-red-500">*</span></label>
              <input
                value={addForm.module_code}
                onChange={e => setAddForm(f => ({ ...f, module_code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') }))}
                placeholder="e.g. NIGHT_OPERATIONS"
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Uppercase, underscores only. Permanent identifier.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display Name <span className="text-red-500">*</span></label>
              <input
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Night and Low-Visibility Operations"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Brief description of this risk area..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input
                value={addForm.category}
                onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. driver, vehicle, environment"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={addForm.sort_order}
                onChange={e => setAddForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => { setShowAdd(false); setAddForm(emptyForm); setError('') }} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active modules */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Active <span className="ml-1.5 text-xs font-normal text-gray-400">({active.length})</span></h2>
        </div>
        {loading ? (
          <p className="p-8 text-center text-gray-400 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Code</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Active</th>
                <th className="px-4 py-2.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {active.map((m, i) => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3">
                    {editId === m.id ? (
                      <input
                        value={editForm.name ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{m.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{m.module_code}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {editId === m.id ? (
                      <input
                        value={editForm.category ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="category"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">{m.category ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(m)} title="Deactivate">
                      <ToggleRight size={20} className="text-green-500" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      {editId === m.id ? (
                        <>
                          <button onClick={() => saveEdit(m)} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                            <Check size={14} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(m)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded" title="Edit">
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inactive modules */}
      {inactive.length > 0 && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-500">Inactive <span className="ml-1.5 text-xs font-normal text-gray-400">({inactive.length}) — hidden from assessment wizard</span></h2>
          </div>
          <table className="w-full text-sm opacity-60">
            <tbody className="divide-y">
              {inactive.map((m, i) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono w-8">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3 font-medium text-gray-600">{m.name}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{m.module_code}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(m)} title="Activate">
                      <ToggleLeft size={20} className="text-gray-300" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Deactivating a template hides it from the wizard dropdown — existing assessments that use it are not affected.
      </p>
    </div>
  )
}
