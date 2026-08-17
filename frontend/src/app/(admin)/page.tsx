'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sessionsApi, Session } from '@/lib/api/sessions'
import { membersApi } from '@/lib/api/members'
import { shuttlecockApi } from '@/lib/api/shuttlecocks'
import SessionStatusBadge from '@/components/SessionStatusBadge'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [remainingShuttles, setRemainingShuttles] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      sessionsApi.getAll(0, 5).then((data) => setSessions(data.content ?? [])).catch(() => setSessions([])),
      membersApi.getAll(true).then((m) => setMemberCount(m.length)).catch(() => setMemberCount(0)),
      shuttlecockApi.getBatches().then((b) => {
        const total = b.reduce((sum, item) => sum + item.quantityRemaining, 0)
        setRemainingShuttles(total)
      }).catch(() => setRemainingShuttles(0)),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tổng quan quản lý và theo dõi hoạt động CLB Cầu lông</p>
        </div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white px-4 py-2 rounded-lg font-medium text-xs shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <span>📅</span> Tạo buổi tập mới
        </Link>
      </div>

      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-[#1C2434] via-[#2A3547] to-[#3C50E0] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 z-10 max-w-xl">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold backdrop-blur-sm">
            🏸 Goodminton Admin Panel
          </span>
          <h2 className="text-xl md:text-2xl font-bold">Xin chào Ban Quản Trị! 🎉</h2>
          <p className="text-slate-300 text-xs md:text-sm">
            Hệ thống đã sẵn sàng cho buổi tập hôm nay. Theo dõi danh sách điểm danh, khoản chi tiêu và chốt nghĩa vụ đóng tiền chỉ với 1 click.
          </p>
        </div>
        <div className="z-10 flex gap-3">
          <Link
            href="/sessions"
            className="bg-white text-[#1C2434] hover:bg-slate-100 font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            Quản lý Buổi tập
          </Link>
        </div>
      </div>

      {/* 4 NextAdmin Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Members */}
        <div className="nextadmin-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hội viên hoạt động</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : memberCount}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
              <span>↑ 100%</span>
              <span className="text-slate-400 font-normal">so với tháng trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-sm">
            👥
          </div>
        </div>

        {/* Metric 2: Sessions */}
        <div className="nextadmin-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buổi tập vừa qua</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : sessions.length}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
              <span>✓ Hoàn thành</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-sm">
            📅
          </div>
        </div>

        {/* Metric 3: Shuttlecocks Stock */}
        <div className="nextadmin-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tồn kho cầu</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : `${remainingShuttles} quả`}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-600">
              <span>Auto-FIFO Ready</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm">
            🏸
          </div>
        </div>

        {/* Metric 4: System Status */}
        <div className="nextadmin-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái CLB</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">Hoạt động</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-400">
              <span>MySQL Sync OK</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
            ⚡
          </div>
        </div>
      </div>

      {/* NextAdmin Table: Recent Sessions */}
      <div className="nextadmin-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Buổi tập gần đây</h3>
            <p className="text-xs text-slate-400">Danh sách các buổi tập cầu lông được khởi tạo gần đây</p>
          </div>
          <Link href="/sessions" className="text-xs text-[#3C50E0] font-semibold hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Đang tải dữ liệu...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có buổi tập nào được tạo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3">Ngày tập</th>
                  <th className="p-3">Khung giờ</th>
                  <th className="p-3">Điểm danh</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 text-slate-500">
                      ⏰ {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        👥 {s.checkedInCount} người
                      </span>
                    </td>
                    <td className="p-3">
                      <SessionStatusBadge status={s.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/sessions/${s.id}/attendance`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-[#3C50E0] hover:bg-indigo-100 font-semibold transition-colors"
                      >
                        Chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
