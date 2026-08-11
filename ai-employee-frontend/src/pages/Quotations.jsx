import { useEffect, useState } from 'react'
import { FilePlus2, Loader2, Plus, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'

const STATUS_STYLES = {
  draft: 'bg-gray-600/20 text-gray-400',
  sent: 'bg-blue-500/15 text-blue-400',
  viewed: 'bg-purple-500/15 text-purple-400',
  accepted: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  cancelled: 'bg-gray-600/20 text-gray-500',
}

const emptyForm = {
  contact_id: '',
  valid_until: '',
  currency: 'USD',
  discount: '0',
}

export default function Quotations() {
  const [quotations, setQuotations] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [lineItems, setLineItems] = useState([{ name: '', quantity: '1', unit_price: '', tax_percent: '0' }])
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [quoteRes, conRes] = await Promise.all([
        api.get('/api/v1/finance/quotations'),
        api.get('/api/v1/crm/contacts'),
      ])
      setQuotations(quoteRes.data)
      setContacts(conRes.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load quotations.')
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

  const handleItemChange = (idx, field, value) => {
    const updated = [...lineItems]
    updated[idx][field] = value
    setLineItems(updated)
  }

  const addItem = () => {
    setLineItems([...lineItems, { name: '', quantity: '1', unit_price: '', tax_percent: '0' }])
  }

  const removeItem = (idx) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== idx))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const items = lineItems
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          tax_percent: Number(i.tax_percent) || 0,
        }))
      if (items.length === 0) {
        setError('Add at least one line item.')
        setSaving(false)
        return
      }
      await api.post('/api/v1/finance/quotations', {
        contact_id: form.contact_id,
        valid_until: form.valid_until || null,
        currency: form.currency,
        discount: Number(form.discount) || 0,
        line_items: items,
      })
      setModalOpen(false)
      setForm(emptyForm)
      setLineItems([{ name: '', quantity: '1', unit_price: '', tax_percent: '0' }])
      setLoading(true)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quotation.')
    } finally {
      setSaving(false)
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
          <h1 className="text-2xl font-bold text-white">Quotations</h1>
          <p className="mt-1 text-sm text-gray-400">{quotations.length} total quotations</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Quotation
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
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <FilePlus2 size={40} className="text-gray-600" />
            <p className="mt-4 text-sm text-gray-400">No quotations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {['Number', 'Contact', 'Valid Until', 'Total', 'Status'].map((h) => (
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
                {quotations.map((q) => (
                  <tr key={q.id} className="transition-colors hover:bg-gray-700/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{q.quote_number}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{getContactName(q.contact_id)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{q.valid_until || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-white">
                      {q.currency} {Number(q.total).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Quotation" wide>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
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
                <p className="mt-1 text-xs text-yellow-500">Create a contact first to create quotations.</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Valid Until</label>
              <input type="date" name="valid_until" value={form.valid_until} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Currency</label>
              <input name="currency" value={form.currency} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Discount</label>
              <input type="number" step="0.01" min="0" name="discount" value={form.discount} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Line Items</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-600"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3 rounded-lg bg-gray-700/40 p-3 sm:grid-cols-[1fr_0.7fr_0.9fr_0.7fr_auto]">
                  <div className="col-span-2 sm:col-span-1">
                    <input
                      required
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Tax %"
                    value={item.tax_percent}
                    onChange={(e) => handleItemChange(idx, 'tax_percent', e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={lineItems.length === 1}
                    className="flex h-10 w-10 items-center justify-center self-center rounded-lg text-gray-400 transition-colors hover:bg-red-600/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
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
              {saving ? 'Creating...' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
