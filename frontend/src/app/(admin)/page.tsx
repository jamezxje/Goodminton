'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import { membersApi } from '@/lib/api/members'
import SessionStatusBadge from '@/components/SessionStatusBadge'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      sessionsApi.getAll(0, 5).then((data) => setSessions(data.content ?? [])).catch(() => setSessions([])),
      membersApi.getAll(true).then((m) => setMemberCount(m.length)).catch(() => setMemberCount(0)),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏸 Goodminton Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan quản lý CLB cầu lông</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{loading ? '...' : memberCount}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Hội viên đang hoạt động</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{loading ? '...' : sessions.length}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">Buổi tập vừa qua</div>
        </div>
      </div>

      {/* Quick Action Button */}
      <Link
        href="/sessions"
        className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 font-semibold shadow-sm transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📅</span> Quản lý & Tạo buổi tập mới
        </span>
        <span>→</span>
      </Link>

      {/* Recent Sessions List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-semibold text-gray-800 text-sm">Buổi tập gần đây</h2>
          <Link href="/sessions" className="text-xs text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Đang tải...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border text-sm">
            Chưa có buổi tập nào
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}/attendance`}
                className="flex justify-between items-center bg-white rounded-xl border px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ⏰ {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-500 font-medium">👥 {s.checkedInCount} người</span>
                  <SessionStatusBadge status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
