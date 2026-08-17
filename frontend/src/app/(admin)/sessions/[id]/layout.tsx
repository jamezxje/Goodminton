'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { sessionsApi, Session } from '@/lib/api/sessions'
import SessionStatusBadge from '@/components/SessionStatusBadge'

const tabs = [
  { href: '/attendance', label: '👥 Điểm danh' },
  { href: '/expenses', label: '💸 Chi tiêu' },
  { href: '/shuttlecocks', label: '🏸 Kho Cầu' },
  { href: '/obligations', label: '🧾 Chia tiền' },
]

export default function SessionDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [closing, setClosing] = useState(false)

  function loadSession() {
    sessionsApi.getById(Number(id)).then(setSession).catch(() => setSession(null))
  }

  useEffect(() => {
    loadSession()
  }, [id])

  async function handleCloseSession() {
    if (!confirm('Chốt buổi sẽ tính toán nghĩa vụ đóng tiền cho tất cả hội viên. Bạn có chắc chắn muốn chốt buổi tập này?')) {
      return
    }
    setClosing(true)
    try {
      await sessionsApi.close(Number(id))
      alert('Đã chốt buổi tập thành công!')
      loadSession()
      router.push(`/sessions/${id}/obligations`)
    } catch {
      alert('Không thể chốt buổi tập!')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Session Top Header Card */}
      {session && (
        <div className="nextadmin-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/sessions" className="text-xs text-[#3C50E0] hover:underline font-semibold">
                  ← Danh sách buổi tập
                </Link>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                Buổi tập ngày {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
              </h1>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                ⏰ Khung giờ: {session.startTime?.slice(0, 5)} – {session.endTime?.slice(0, 5)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SessionStatusBadge status={session.status} />
              {session.status !== 'CLOSED' && (
                <button
                  onClick={handleCloseSession}
                  disabled={closing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {closing ? 'Đang chốt...' : '🔒 Chốt buổi tập'}
                </button>
              )}
            </div>
          </div>

          {/* 4 Tabs Bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
            {tabs.map((t) => {
              const fullPath = `/sessions/${id}${t.href}`
              const isActive = pathname === fullPath
              return (
                <Link
                  key={t.href}
                  href={fullPath}
                  className={`pb-3 px-4 transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-[#3C50E0] text-[#3C50E0] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  )
}
