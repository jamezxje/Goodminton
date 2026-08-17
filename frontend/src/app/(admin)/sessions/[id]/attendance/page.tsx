'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { attendanceApi, Attendance } from '@/lib/api/attendance'

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState('')
  const [addingGuest, setAddingGuest] = useState(false)

  const loadAttendances = useCallback(async () => {
    try {
      const data = await attendanceApi.getAll(sessionId)
      setAttendances(data)
    } catch {
      setAttendances([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadAttendances()
  }, [loadAttendances])

  async function handleToggle(aId: number) {
    try {
      const updated = await attendanceApi.toggle(sessionId, aId)
      setAttendances((prev) => prev.map((a) => (a.id === aId ? updated : a)))
    } catch {
      alert('Không thể thay đổi điểm danh!')
    }
  }

  async function handleAddGuest() {
    if (!guestName.trim()) return
    setAddingGuest(true)
    try {
      await attendanceApi.addGuest(sessionId, guestName.trim())
      setGuestName('')
      loadAttendances()
    } catch {
      alert('Thêm khách vãng lai thất bại!')
    } finally {
      setAddingGuest(false)
    }
  }

  async function handleDeleteGuest(aId: number) {
    if (!confirm('Bạn có chắc muốn xóa khách vãng lai này?')) return
    try {
      await attendanceApi.deleteGuest(sessionId, aId)
      loadAttendances()
    } catch {
      alert('Xóa khách thất bại!')
    }
  }

  const checkedInCount = attendances.filter((a) => a.isCheckedIn).length

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải điểm danh...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border">
        <span className="text-sm font-medium text-gray-700">Có mặt:</span>
        <span className="text-sm font-bold text-blue-600">
          {checkedInCount} / {attendances.length} người
        </span>
      </div>

      {/* Add guest input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tên khách vãng lai..."
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
          className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddGuest}
          disabled={addingGuest || !guestName.trim()}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {addingGuest ? 'Đang thêm...' : '+ Thêm khách'}
        </button>
      </div>

      {/* Attendance list */}
      <div className="space-y-2">
        {attendances.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-white rounded-xl border px-4 py-3">
            <div>
              <div className="font-medium text-gray-900">{a.memberName ?? a.guestName}</div>
              {!a.memberName && <div className="text-xs text-amber-600 font-medium">Khách vãng lai</div>}
            </div>
            <div className="flex items-center gap-3">
              {!a.memberName && (
                <button
                  onClick={() => handleDeleteGuest(a.id)}
                  className="text-red-400 hover:text-red-600 text-sm px-1"
                  title="Xóa khách"
                >
                  🗑
                </button>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.isCheckedIn}
                  onChange={() => handleToggle(a.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
