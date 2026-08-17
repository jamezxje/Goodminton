'use client'

import { useEffect, useState } from 'react'
import { membersApi, Member } from '@/lib/api/members'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  function loadMembers() {
    setLoading(true)
    membersApi
      .getAll(false)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMembers()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim()) return
    await membersApi.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      joinedDate: new Date().toISOString().split('T')[0],
    })
    setShowAddModal(false)
    setFullName('')
    setPhone('')
    setEmail('')
    loadMembers()
  }

  async function handleToggleStatus(member: Member) {
    await membersApi.setStatus(member.id, !member.isActive)
    loadMembers()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Hội viên</h1>
          <p className="text-xs text-slate-500 mt-0.5">Danh sách thành viên chính thức tham gia CLB Goodminton</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <span>➕</span> Thêm hội viên mới
        </button>
      </div>

      {/* Members Table Card */}
      <div className="nextadmin-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách ({members.length} thành viên)
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Đang tải danh sách hội viên...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có hội viên nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3">Hội viên</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Ngày tham gia</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-[#3C50E0] font-bold flex items-center justify-center text-xs shadow-sm">
                          {m.fullName?.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div>{m.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">ID: #{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        📞 {m.phone}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{m.email || '—'}</td>
                    <td className="p-3 text-slate-500 font-medium">
                      {new Date(m.joinedDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          m.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        title={m.isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            m.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm hội viên mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (tuỳ chọn)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nva@gmail.com"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Thêm hội viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
