'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

const menuGroups = [
  {
    title: 'MAIN MENU',
    items: [
      { href: '/', label: 'Dashboard', icon: '📊' },
      { href: '/sessions', label: 'Buổi tập', icon: '📅' },
      { href: '/members', label: 'Hội viên', icon: '👥' },
      { href: '/shuttlecock-batches', label: 'Kho Cầu', icon: '🏸' },
    ],
  },
  {
    title: 'HỆ THỐNG',
    items: [{ href: '/settings', label: 'Cài đặt CLB', icon: '⚙️' }],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-[#1C2434] text-slate-300 min-h-screen flex flex-col justify-between p-4 hidden md:flex shrink-0 border-r border-slate-800 shadow-lg">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg text-white font-bold shadow-md shadow-indigo-600/30">
            🏸
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-base">GOODMINTON</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Club Management</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <div className="text-[11px] font-semibold text-slate-400 px-3 mb-2 tracking-wider">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#3C50E0] text-white shadow-md shadow-indigo-500/20 font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span className="text-base">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
