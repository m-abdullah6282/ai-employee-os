import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Target,
  FileText,
  CheckSquare,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import api from '../api/axios'

const statCards = [
  { key: 'contacts', label: 'Total Contacts', icon: Users, to: '/crm/contacts', color: 'blue' },
  { key: 'leads', label: 'Total Leads', icon: Target, to: '/crm/leads', color: 'purple' },
  { key: 'invoices', label: 'Total Invoices', icon: FileText, to: '/finance/invoices', color: 'green' },
  { key: 'tasks', label: 'Total Tasks', icon: CheckSquare, to: '/tasks', color: 'orange' },
]

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  green: 'bg-emerald-500/10 text-emerald-400',
  orange: 'bg-orange-500/10 text-orange-400',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, leads: 0, invoices: 0, tasks: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [contacts, leads, invoices, tasks] = await Promise.all([
          api.get('/api/v1/crm/contacts'),
          api.get('/api/v1/crm/leads'),
          api.get('/api/v1/finance/invoices'),
          api.get('/api/v1/tasks/'),
        ])
        const data = {
          contacts: contacts.data,
          leads: leads.data,
          invoices: invoices.data,
          tasks: tasks.data,
        }
        setStats({
          contacts: data.contacts.length,
          leads: data.leads.length,
          invoices: data.invoices.length,
          tasks: data.tasks.length,
        })

        const recentItems = [
          ...data.contacts.slice(0, 3).map((c) => ({
            id: c.id,
            type: 'contact',
            label: `${c.first_name} ${c.last_name || ''}`,
            detail: c.company || c.email || 'New contact',
            to: '/crm/contacts',
          })),
          ...data.leads.slice(0, 3).map((l) => ({
            id: l.id,
            type: 'lead',
            label: l.title,
            detail: `Status: ${l.status}`,
            to: '/crm/leads',
          })),
          ...data.invoices.slice(0, 3).map((i) => ({
            id: i.id,
            type: 'invoice',
            label: i.invoice_number,
            detail: `${i.currency} ${Number(i.total).toFixed(2)}`,
            to: '/finance/invoices',
          })),
          ...data.tasks.slice(0, 3).map((t) => ({
            id: t.id,
            type: 'task',
            label: t.title,
            detail: `Priority: ${t.priority}`,
            to: '/tasks',
          })),
        ]
        setRecent(recentItems.slice(0, 8))
        setError('')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/40 p-6 text-red-300">{error}</div>
    )
  }

  const typeIcon = {
    contact: Users,
    lead: Target,
    invoice: FileText,
    task: CheckSquare,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">Overview of your business operations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, to, color }) => (
          <Link
            key={key}
            to={to}
            className="group rounded-xl bg-gray-800 p-5 shadow-lg ring-1 ring-gray-700 transition-all hover:-translate-y-0.5 hover:ring-gray-600"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorMap[color]}`}>
                <Icon size={22} />
              </div>
              <ArrowRight size={18} className="text-gray-600 transition-colors group-hover:text-gray-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{stats[key]}</p>
            <p className="mt-1 text-sm text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-gray-800 shadow-lg ring-1 ring-gray-700">
        <div className="border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">
            No activity yet. Create your first contact, lead, invoice, or task.
          </p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {recent.map((item) => {
              const Icon = typeIcon[item.type]
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-700/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-700 text-gray-300">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.label}</p>
                      <p className="truncate text-xs text-gray-400">{item.detail}</p>
                    </div>
                    <span className="rounded-full bg-gray-700 px-2.5 py-1 text-xs capitalize text-gray-300">
                      {item.type}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
