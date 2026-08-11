import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  job_title: '',
}

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/api/v1/crm/contacts')
      setContacts(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load contacts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchContacts()
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
      await api.post('/api/v1/crm/contacts', form)
      setModalOpen(false)
      setForm(emptyForm)
      setLoading(true)
      await fetchContacts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create contact.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/v1/crm/contacts/${id}`)
      setLoading(true)
      await fetchContacts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete contact.')
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-600 bg-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="mt-1 text-sm text-gray-400">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-gray-800 shadow-lg ring-1 ring-gray-700">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Users size={40} className="text-gray-600" />
            <p className="mt-4 text-sm text-gray-400">No contacts yet</p>
            <p className="text-xs text-gray-500">Click &quot;Add Contact&quot; to create your first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {['Name', 'Email', 'Phone', 'Company', 'Job Title', ''].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {contacts.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-gray-700/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{c.email || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{c.phone || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{c.company || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{c.job_title || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === c.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Contact">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">First Name *</label>
              <input required name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Company</label>
              <input name="company" value={form.company} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Job Title</label>
              <input name="job_title" value={form.job_title} onChange={handleChange} className={inputClass} />
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
              {saving ? 'Creating...' : 'Create Contact'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
