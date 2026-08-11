import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-4 py-3 backdrop-blur-lg sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-white sm:text-xl">AI Employee OS</h2>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-gray-800 py-1.5 pl-2 pr-3 ring-1 ring-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.full_name?.[0]?.toUpperCase() || <UserIcon size={16} />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 ring-1 ring-gray-700 transition-colors hover:bg-red-600/20 hover:text-red-400"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
