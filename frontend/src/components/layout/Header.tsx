'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 md:px-6 shadow-sm">
      {/* Left side: Hamburger button + Search Bar */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            ☰
          </button>
        )}

        <div className="relative hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm nhanh... ⌘K"
            className="w-64 md:w-80 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right side: Actions + Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          title="Thông báo"
        >
          <span>🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
              AD
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Admin CLB</div>
              <div className="text-[10px] text-slate-500 font-medium">Quản trị viên</div>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">▼</span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50 text-xs text-slate-700">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Admin CLB Goodminton</p>
                <p className="text-slate-400 text-[10px]">admin@goodminton.vn</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  router.push('/settings')
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span>⚙️</span> Cài đặt CLB
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
              >
                <span>🚪</span> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
