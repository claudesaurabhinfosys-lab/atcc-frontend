'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Check, X, ChevronDown, ChevronRight,
} from 'lucide-react'

interface RiskModule { id: number; module_code: string; name: string; is_active: boolean }
interface Hazard {
  id: number
  hazard_code: string
  module_code: string
  hazard_text: string
  cause: string | null
  consequence: string | null
  is_active: boolean
}

const emptyAdd = { hazard_code: '', hazard_text: '', cause: '', consequence: '' }

export default function HazardsListPage() {
  const [modules, setModules]   = useState<RiskModule[]>([])
  const [hazards, setHazards]   = useState<Hazard[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [editId, setEditId]     = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Hazard>>({})
  const [addModule, setAddModule] = useState<string | null>(null)
  const [addForm, setAddForm]   = useState(emptyAdd)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/super-admin/global-knowledge'),
      api.get('/super-admin/hazards'),
    ]).then(([mRes, hRes]) => {
      setModules(Array.isArray(mRes.data) ? mRes.data : mRes.data?.data ?? [])
      setHazards(Array.isArray(hRes.data) ? hRes.data : hRes.data?.data ?? [])
      // default: expand first module
      const first = (Array.isArray(mRes.data) ? mRes.data : mRes.data?.data ?? [])[0]
      if (first) setExpanded(e => ({ [first.module_code]: true, ...e }))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const toggle = (code: string) =>
    setExpanded(e => ({ ...e, [code]: !e[code] }))

  // ── Edit ────────────────────────────────────────────────────────────────────
  const startEdit = (h: Hazard) => {
    setEditId(h.id)
    setEditForm({ hazard_text: h.hazard_text, cause: h.cause ?? '', consequence: h.consequence ?? '' })
    setAddModule(null)
    setError('')
  }
  const cancelEdit = () => { setEditId(null); setEditForm({}) }
  const saveEdit = async (h: Hazard) => {
    if (!editForm.hazard_text?.trim()) { setError('Hazard text is required.'); return }
    setSaving(true)
    try {
      await api.put(`/super-admin/hazards/${h.id}`, editForm)
      setEditId(null)
      loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Save failed.')
    } finally { setSaving(false) }
  }

  // ── Toggle active ────────────────────────────────────────────────────────────
  const toggleActive = async (h: Hazard) => {
    await api.put(`/super-admin/hazards/${h.id}`, { ...h, is_active: !h.is_active })
    loadAll()
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteHazard = async (h: Hazard) => {
    if (!confirm(`Delete hazard "${h.hazard_text.slice(0, 60)}"? This cannot be undone.`)) return
    await api.delete(`/super-admin/hazards/${h.id}`)
    loadAll()
  }

  // ── Add ──────────────────────────────────────────────────────────────────────
  const openAdd = (moduleCode: string) => {
    setAddModule(moduleCode)
    setAddForm({ ...emptyAdd, hazard_code: `${moduleCode}_HZ_` })
    setEditId(null)
    setError('')
    setExpanded(e => ({ ...e, [moduleCode]: true }))
  }
  const cancelAdd = () => { setAddModule(null); setAddForm(emptyAdd) }
  const saveAdd = async () => {
    setError('')
    if (!addForm.hazard_code.trim() || !addForm.hazard_text.trim()) {
      setError('Hazard Code and Hazard Text are required.')
      return
    }
    if (!/^[A-Z0-9_]+$/.test(addForm.hazard_code)) {
      setError('Hazard Code must be uppercase letters, numbers and underscores only.')
      return
    }
    setSaving(true)
    try {
      await api.post('/super-admin/hazards', { ...addForm, module_code: addModule })
      setAddModule(null)
      setAddForm(emptyAdd)
      loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.errors?.hazard_code?.[0] ?? 'Create failed.')
    } finally { setSaving(false) }
  }

  const byModule = (code: string) => hazards.filter(h => h.module_code === code)

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hazards List</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage hazards for each area of risk. Active hazards appear in the assessment wizard.
          Inactive hazards are hidden but do not affect existing assessments.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-12 text-sm">Loading...</p>
      ) : (
        <div className="space-y-2">
          {modules.map(mod => {
            const modHazards = byModule(mod.module_code)
            const activeCount = modHazards.filter(h => h.is_active).length
            const isOpen = !!expanded[mod.module_code]

            return (
              <div key={mod.module_code} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {/* Module header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => toggle(mod.module_code)}
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
                    <span className="font-semibold text-gray-800 text-sm">{mod.name}</span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{mod.module_code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{activeCount} of {modHazards.length} active</span>
                    <button
                      onClick={e => { e.stopPropagation(); openAdd(mod.module_code) }}
                      className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded font-medium"
                    >
                      <Plus size={12} /> Add Hazard
                    </button>
                  </div>
                </div>

                {/* Hazard rows */}
                {isOpen && (
                  <div className="border-t divide-y">
                    {/* Add form inline */}
                    {addModule === mod.module_code && (
                      <div className="bg-blue-50 px-4 py-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-700">New Hazard — {mod.name}</p>
                        {error && <p className="text-xs text-red-600">{error}</p>}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hazard Code <span className="text-red-500">*</span></label>
                            <input
                              value={addForm.hazard_code}
                              onChange={e => setAddForm(f => ({ ...f, hazard_code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') }))}
                              className="w-full border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder={`${mod.module_code}_HZ_XX`}
                            />
                            <p className="text-xs text-gray-400 mt-0.5">Uppercase, underscores only. Permanent.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hazard Text <span className="text-red-500">*</span></label>
                            <input
                              value={addForm.hazard_text}
                              onChange={e => setAddForm(f => ({ ...f, hazard_text: e.target.value }))}
                              className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Describe the hazard..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cause</label>
                            <input
                              value={addForm.cause}
                              onChange={e => setAddForm(f => ({ ...f, cause: e.target.value }))}
                              className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Root cause..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Consequence</label>
                            <input
                              value={addForm.consequence}
                              onChange={e => setAddForm(f => ({ ...f, consequence: e.target.value }))}
                              className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Potential consequence..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveAdd} disabled={saving} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Add Hazard'}
                          </button>
                          <button onClick={cancelAdd} className="px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    )}

                    {modHazards.length === 0 && addModule !== mod.module_code && (
                      <p className="px-5 py-4 text-xs text-gray-400 italic">No hazards for this area of risk.</p>
                    )}

                    {modHazards.map(h => (
                      <div key={h.id} className={`px-4 py-3 ${!h.is_active ? 'opacity-50 bg-gray-50' : ''}`}>
                        {editId === h.id ? (
                          /* Edit mode */
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-0.5">Hazard Text <span className="text-red-500">*</span></label>
                                <input
                                  value={editForm.hazard_text ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, hazard_text: e.target.value }))}
                                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-0.5">Cause</label>
                                <input
                                  value={editForm.cause ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, cause: e.target.value }))}
                                  className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-0.5">Consequence</label>
                                <input
                                  value={editForm.consequence ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, consequence: e.target.value }))}
                                  className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(h)} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-xs font-medium disabled:opacity-50">
                                <Check size={12} /> {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Read mode */
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{h.hazard_code}</span>
                                <p className="text-sm font-medium text-gray-900">{h.hazard_text}</p>
                              </div>
                              {(h.cause || h.consequence) && (
                                <p className="text-xs text-gray-400 truncate">
                                  {h.cause && <span>Cause: {h.cause}</span>}
                                  {h.cause && h.consequence && <span className="mx-1">|</span>}
                                  {h.consequence && <span>Consequence: {h.consequence}</span>}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => toggleActive(h)} title={h.is_active ? 'Deactivate' : 'Activate'}>
                                {h.is_active
                                  ? <ToggleRight size={18} className="text-green-500" />
                                  : <ToggleLeft size={18} className="text-gray-300" />}
                              </button>
                              <button onClick={() => startEdit(h)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded" title="Edit">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => deleteHazard(h)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 pb-4">
        Deactivating a hazard hides it from the assessment wizard. Existing assessments that reference it are unaffected.
      </p>
    </div>
  )
}
