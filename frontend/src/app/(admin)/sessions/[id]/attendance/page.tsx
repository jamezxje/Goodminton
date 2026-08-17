'use client'

import { useEffect, useState, use } from 'react'
import { attendanceApi, Attendance } from '@/lib/api/attendance'

export default function AttendanceTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    attendanceApi
      .getAll(sessionId)
      .then(setAttendances)
      .catch(() => setAttendances([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [sessionId])

  async function handleToggle(attId: number) {
    await attendanceApi.toggle(sessionId, attId)
    load()
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault()
    if (!guestName.trim()) return
    await attendanceApi.addGuest(sessionId, guestName.trim())
    setGuestName('')
    load()
  }

  async function handleDelete(attId: number) {
    if (!confirm('Bạn có chắc muốn xóa bản ghi điểm danh này?')) return
    await attendanceApi.deleteGuest(sessionId, attId)
    load()
  }

  const checkedInCount = attendances.filter((a) => a.isCheckedIn).length

  return (
    <div className="nextadmin-card p-5 space-y-6">
      {/* Attendance Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Điểm danh hội viên & khách</h3>
          <p className="text-xs text-slate-500 mt-0.5">Bật/tắt switch để điểm danh thực tế người đi tập</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
          <span>👥 Có mặt: </span>
          <span className="text-[#3C50E0]">{checkedInCount}</span> / {attendances.length} người
        </div>
      </div>

      {/* Add Guest Form */}
      <form onSubmit={handleAddGuest} className="flex gap-2">
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Thêm tên khách vãng lai..."
          className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm bg-slate-50 outline-none focus:border-[#3C50E0] focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!guestName.trim()}
          className="bg-[#3C50E0] hover:bg-[#3444B9] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
        >
          + Thêm khách
        </button>
      </form>

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Đang tải danh sách điểm danh...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Loại</th>
                <th className="p-3 text-center">Trạng thái Điểm danh</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {attendances.map((item) => {
                const name = item.memberName || item.guestName || ''
                const isGuest = !!item.guestName
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                        <span>{name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {isGuest ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold text-[10px]">
                          Khách vãng lai
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#3C50E0] font-semibold text-[10px]">
                          Hội viên chính thức
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isCheckedIn ? 'bg-[#3C50E0]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isCheckedIn ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      {isGuest && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa khách"
                        >
                          🗑 Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
