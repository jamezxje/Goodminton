'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import CreateSessionDialog from './CreateSessionDialog'
import SessionStatusBadge from '@/components/SessionStatusBadge'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await sessionsApi.getAll()
      setSessions(data.content ?? [])
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách buổi tập</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý lịch tập & điểm danh</p>
        </div>
        <CreateSessionDialog onCreated={loadSessions} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
          <p>Chưa có buổi tập nào được tạo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}/attendance`}
              className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">
                    {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    ⏰ {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}
                  </div>
                  {s.notes && <div className="text-xs text-gray-400 mt-1">📝 {s.notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SessionStatusBadge status={s.status} />
                  <span className="text-xs text-gray-500 font-medium">👥 {s.checkedInCount} người</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
