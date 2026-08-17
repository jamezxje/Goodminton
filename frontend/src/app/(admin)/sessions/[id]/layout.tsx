'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sessionsApi, Session } from '@/lib/api/sessions'
import SessionStatusBadge from '@/components/SessionStatusBadge'

const tabs = [
  { label: '👥 Điểm danh', href: 'attendance' },
  { label: '💸 Chi tiêu', href: 'expenses' },
  { label: '🏸 Cầu', href: 'shuttlecocks' },
  { label: '🧾 Chia tiền', href: 'obligations' },
]

export default function SessionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    sessionsApi.getById(Number(id)).then(setSession).catch(() => setSession(null))
  }, [id])

  async function handleClose() {
    if (!confirm('Chốt buổi sẽ tính toán nghĩa vụ đóng tiền. Bạn có chắc chắn muốn chốt buổi tập này?')) return
    setClosing(true)
    try {
      await sessionsApi.close(Number(id))
      const updated = await sessionsApi.getById(Number(id))
      setSession(updated)
      alert('Đã chốt buổi tập thành công!')
    } catch {
      alert('Chốt buổi tập thất bại!')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {session && (
        <div className="px-4 py-3 bg-white border-b flex justify-between items-center">
          <div>
            <div className="font-bold text-gray-900">
              {new Date(session.sessionDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              ⏰ {session.startTime?.slice(0, 5)} – {session.endTime?.slice(0, 5)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SessionStatusBadge status={session.status} />
            {session.status !== 'CLOSED' && (
              <button
                onClick={handleClose}
                disabled={closing}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {closing ? 'Đang chốt...' : 'Chốt buổi'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const href = `/sessions/${id}/${tab.href}`
            const active = pathname === href
            return (
              <Link
                key={tab.href}
                href={href}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
