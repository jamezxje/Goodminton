'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Tổng quan', icon: '📊' },
  { href: '/sessions', label: 'Buổi tập', icon: '📅' },
  { href: '/members', label: 'Hội viên', icon: '👥' },
  { href: '/shuttlecock-batches', label: 'Kho Cầu', icon: '🏸' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1C2434] border-t border-slate-800 z-50 flex justify-around p-2 shadow-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
