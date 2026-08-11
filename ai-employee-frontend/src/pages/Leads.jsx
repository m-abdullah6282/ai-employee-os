import { useEffect, useState } from 'react'
import { Loader2, Plus, Target, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

const statusStyles = {
  new: 'border-blue-500/30 bg-blue-500/5',
  contacted: 'border-purple-500/30 bg-purple-500/5',
  qualified: 'border-cyan-500/30 bg-cyan-500/5',
  proposal: 'border-orange-500/30 bg-orange-500/5',
  negotiation: 'border-yellow-500/30 bg-yellow-500/5',
  won: 'border-emerald-500/30 bg-emerald-500/5',
  lost: 'border-red-500/30 bg-red-500/5',
}

const dotColors = {
  new: 'bg-blue-400',
  contacted: 'bg-purple-400',
  qualified: 'bg-cyan-400',
  proposal: 'bg-orange-400',
  negotiation: 'bg-yellow-400',
  won: 'bg-emerald-400',
  lost: 'bg-red-400',
}

const emptyForm = {
  title: '',
  contact_id: '',
  value: '',
  currency: 'USD',
  probability: '0',
  status: 'new',
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchData = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        api.get('/api/v1/crm/leads'),
        api.get('/api/v1/crm/contacts'),
      ])
      setLeads(leadsRes.data)
      setContacts(contactsRes.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load leads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchData()
    }
    load()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/v1/crm/leads', {
        ...form,
        value: form.value === '' ? null : Number(form.value),
        probability: Number(form.probability) || 0,
      })
      setModalOpen(false)
      setForm(emptyForm)
      setLoading(true)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create lead.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (lead, newStatus) => {
    if (newStatus === lead.status) return
    setUpdatingId(lead.id)
    setError('')
    try {
      await api.patch(`/api/v1/crm/leads/${lead.id}`, { status: newStatus })
      setLoading(true)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update lead status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/v1/crm/leads/${id}`)
      setLoading(true)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete lead.')
    } finally {
      setDeletingId(null)
    }
  }

  const getContactName = (id) => {
    const c = contacts.find((x) => x.id === id)
    return c ? `${c.first_name} ${c.last_name || ''}`.trim() : 'Unknown'
  }

  const inputClass =
    'w-full rounded-lg border border-gray-600 bg-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads Pipeline</h1>
          <p className="mt-1 text-sm text-gray-400">{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const columnLeads = leads.filter((l) => l.status === status)
            return (
              <div
                key={status}
                className={`w-64 shrink-0 rounded-xl border p-3 ${statusStyles[status]}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColors[status]}`} />
                  <h3 className="text-sm font-semibold capitalize text-white">{status}</h3>
                  <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnLeads.length === 0 && (
                    <p className="rounded-lg border border-dashed border-gray-600 px-3 py-4 text-center text-xs text-gray-500">
                      No leads
                    </p>
                  )}
                  {columnLeads.map((lead) => (
                    <div key={lead.id} className="rounded-lg bg-gray-800 p-3 shadow ring-1 ring-gray-700">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{lead.title}</p>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="shrink-0 rounded p-1 text-gray-500 transition-colors hover:text-red-400"
                        >
                          {deletingId === lead.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-400">{getContactName(lead.contact_id)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {lead.currency} {lead.value != null ? Number(lead.value).toFixed(2) : '0.00'}
                        </span>
                        <span className="text-xs text-gray-400">{lead.probability}%</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {updatingId === lead.id && <Loader2 size={14} className="animate-spin text-blue-400" />}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          disabled={updatingId === lead.id}
                          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-2 py-1.5 text-xs text-white outline-none transition-colors focus:border-blue-500"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Lead">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Title *</label>
            <input required name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Website redesign project" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Contact *</label>
            <select required name="contact_id" value={form.contact_id} onChange={handleChange} className={inputClass}>
              <option value="">Select a contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name || ''} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
            {contacts.length === 0 && (
              <p className="mt-1 text-xs text-yellow-500">Create a contact first to assign it to a lead.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Value</label>
              <input type="number" step="0.01" name="value" value={form.value} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Currency</label>
              <input name="currency" value={form.currency} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Probability (%)</label>
              <input type="number" min="0" max="100" name="probability" value={form.probability} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {contacts.length === 0 && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-700/50 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
          <Target size={16} />
          No contacts found. Add contacts before creating leads.
        </div>
      )}
    </div>
  )
}
