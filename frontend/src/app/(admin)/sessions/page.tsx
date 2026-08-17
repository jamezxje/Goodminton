'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import SessionStatusBadge from '@/components/SessionStatusBadge'
import CreateSessionDialog from './CreateSessionDialog'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)

  function loadSessions() {
    setLoading(true)
    sessionsApi
      .getAll()
      .then((data) => setSessions(data.content ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSessions()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Title + Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Buổi tập</h1>
          <p className="text-xs text-slate-500 mt-0.5">Danh sách lịch tập, điểm danh, chi tiêu và chia tiền CLB</p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <span>➕</span> Tạo buổi tập mới
        </button>
      </div>

      {/* Sessions Grid / Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Đang tải danh sách buổi tập...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-4xl">📅</div>
          <div className="font-semibold text-slate-700">Chưa có buổi tập nào</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bắt đầu tạo buổi tập đầu tiên để quản lý điểm danh và tự động chia tiền cho hội viên.
          </p>
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 bg-[#3C50E0] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
          >
            Tạo buổi tập mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}/attendance`}
              className="nextadmin-card p-5 hover:border-indigo-400 hover:shadow-md transition-all group space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-[#3C50E0] transition-colors">
                    {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    ⏰ Khung giờ: {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}
                  </div>
                </div>
                <SessionStatusBadge status={s.status} />
              </div>

              {s.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  &quot;{s.notes}&quot;
                </p>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                  👥 {s.checkedInCount} người có mặt
                </span>
                <span className="text-[#3C50E0] font-semibold group-hover:translate-x-1 transition-transform">
                  Chi tiết →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal dialog */}
      {openCreate && <CreateSessionDialog onCreated={() => { setOpenCreate(false); loadSessions(); }} />}
    </div>
  )
}
