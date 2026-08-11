import { useEffect, useState } from 'react'
import { CheckSquare, Loader2, Plus, Trash2 } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'

const STATUSES = ['todo', 'in_progress', 'done', 'cancelled']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const priorityStyles = {
  low: 'bg-gray-600/20 text-gray-400',
  medium: 'bg-blue-500/15 text-blue-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
}

const statusStyles = {
  todo: 'bg-gray-600/20 text-gray-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  done: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/v1/tasks/')
      setTasks(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchTasks()
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
      await api.post('/api/v1/tasks/', {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      })
      setModalOpen(false)
      setForm(emptyForm)
      setLoading(true)
      await fetchTasks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    if (newStatus === task.status) return
    setUpdatingId(task.id)
    setError('')
    try {
      await api.patch(`/api/v1/tasks/${task.id}`, { status: newStatus })
      setLoading(true)
      await fetchTasks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/v1/tasks/${id}`)
      setLoading(true)
      await fetchTasks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete task.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDueDate = (d) => {
    if (!d) return 'No due date'
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return d
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-600 bg-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-400">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Task
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
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <CheckSquare size={40} className="text-gray-600" />
            <p className="mt-4 text-sm text-gray-400">No tasks yet</p>
            <p className="text-xs text-gray-500">Click &quot;Add Task&quot; to create your first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {['Title', 'Description', 'Priority', 'Due Date', 'Status', ''].map((h) => (
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
                {tasks.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-700/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{t.title}</td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-300">{t.description || '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityStyles[t.priority] || priorityStyles.medium}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{formatDueDate(t.due_date)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        {updatingId === t.id && <Loader2 size={14} className="animate-spin text-blue-400" />}
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t, e.target.value)}
                          disabled={updatingId === t.id}
                          className={`rounded-lg border border-gray-600 bg-gray-700 px-2 py-1.5 text-xs capitalize text-white outline-none transition-colors focus:border-blue-500 ${statusStyles[t.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === t.id ? (
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Title *</label>
            <input required name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Prepare monthly report" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className={inputClass}
              placeholder="Optional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Due Date</label>
              <input type="datetime-local" name="due_date" value={form.due_date} onChange={handleChange} className={inputClass} />
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
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
