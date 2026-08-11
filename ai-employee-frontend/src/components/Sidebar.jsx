import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Target,
  FileText,
  FilePlus2,
  CheckSquare,
  Mail,
  Bot,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/crm/contacts', label: 'Contacts', icon: Users },
  { to: '/crm/leads', label: 'Leads', icon: Target },
  { to: '/finance/invoices', label: 'Invoices', icon: FileText },
  { to: '/finance/quotations', label: 'Quotations', icon: FilePlus2 },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/email', label: 'Send Email', icon: Mail },
]

export default function Sidebar({ open, onClose }) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">AI Employee OS</h1>
          <p className="text-xs text-gray-400">Business Operating System</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 px-6 py-4">
        <p className="text-xs text-gray-500">Powered by AI Agents</p>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  )
}
