'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { removeToken } from '@/lib/auth'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/sessions', label: 'Buổi tập', icon: '📅' },
  { href: '/members', label: 'Hội viên', icon: '👥' },
  { href: '/shuttlecock-batches', label: 'Kho Cầu', icon: '🏸' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    removeToken()
    document.cookie = 'goodminton_token=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r px-4 py-6">
      <div className="text-xl font-bold mb-8 px-2 text-gray-900">🏸 Goodminton</div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4 w-full text-left"
      >
        <span>🚪</span> Đăng xuất
      </button>
    </aside>
  )
}
