'use client'

import { useEffect, useState, useCallback } from 'react'
import { membersApi, Member } from '@/lib/api/members'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    joinedDate: new Date().toISOString().split('T')[0],
  })

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await membersApi.getAll()
      setMembers(data)
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await membersApi.create({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        joinedDate: form.joinedDate,
      })
      setOpenModal(false)
      setForm({ fullName: '', phone: '', email: '', joinedDate: new Date().toISOString().split('T')[0] })
      loadMembers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || 'Thêm hội viên thất bại!')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleStatus(id: number, currentActive: boolean) {
    try {
      await membersApi.setStatus(id, !currentActive)
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !currentActive } : m)))
    } catch {
      alert('Thay đổi trạng thái hội viên thất bại!')
    }
  }

  const activeCount = members.filter((m) => m.isActive).length

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hội viên</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng cộng {activeCount} hội viên đang hoạt động</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
        >
          + Thêm hội viên
        </button>
      </div>

      {/* Add Member Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Thêm hội viên mới</h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="0901234567"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (tuỳ chọn)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="nva@gmail.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tham gia</label>
                <input
                  type="date"
                  value={form.joinedDate}
                  onChange={(e) => setForm((f) => ({ ...f, joinedDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Đang thêm...' : 'Thêm hội viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải danh sách hội viên...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">Chưa có hội viên nào</div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-xl border px-4 py-3.5 flex justify-between items-center transition-all ${
                !m.isActive ? 'opacity-50 bg-gray-50' : ''
              }`}
            >
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {m.fullName}
                  {!m.isActive && <span className="text-xs text-red-500 font-normal">(Tạm dừng)</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  📞 {m.phone} {m.email ? `· ✉️ ${m.email}` : ''}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Tham gia: {new Date(m.joinedDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.isActive}
                  onChange={() => handleToggleStatus(m.id, m.isActive)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
