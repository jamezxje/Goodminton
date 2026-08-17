'use client'

import { useEffect, useState, use } from 'react'
import { expensesApi, SessionExpense, ExpenseCategory } from '@/lib/api/expenses'
import { membersApi, Member } from '@/lib/api/members'

export default function ExpensesTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)

  const [expenses, setExpenses] = useState<SessionExpense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [paidByMemberId, setPaidByMemberId] = useState<number | ''>('')
  const [description, setDescription] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      expensesApi.getAll(sessionId).then(setExpenses),
      expensesApi.getCategories().then(setCategories),
      membersApi.getAll(true).then(setMembers),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [sessionId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId || !amount || !paidByMemberId) return
    await expensesApi.add(sessionId, {
      categoryId: Number(categoryId),
      amount: Number(amount),
      paidByMemberId: Number(paidByMemberId),
      description,
    })
    setShowAdd(false)
    setAmount('')
    setDescription('')
    load()
  }

  async function handleDelete(expId: number) {
    if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) return
    await expensesApi.delete(sessionId, expId)
    load()
  }

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="nextadmin-card p-5 space-y-6">
      {/* Total Expense Summary Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Quản lý khoản chi buổi tập</h3>
          <p className="text-xs text-slate-500 mt-0.5">Tiền sân, nước ngọt và các khoản mua sắm phát sinh</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
            <span>💸 Tổng chi: </span>
            <span className="text-emerald-600 font-extrabold text-sm">{totalExpense.toLocaleString('vi-VN')} đ</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-[#3C50E0] hover:bg-[#3444B9] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            {showAdd ? 'Hủy' : '+ Thêm khoản chi'}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800">Thêm khoản chi phát sinh mới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Danh mục chi *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
                required
              >
                <option value="">Chọn danh mục...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Số tiền (đ) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200000"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Người ứng tiền *</label>
              <select
                value={paidByMemberId}
                onChange={(e) => setPaidByMemberId(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
                required
              >
                <option value="">Chọn người trả...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Ghi chú</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: 3 chai nước ngọt..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors"
          >
            Lưu khoản chi
          </button>
        </form>
      )}

      {/* Expenses Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Đang tải danh sách khoản chi...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Chưa có khoản chi nào trong buổi này
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Danh mục</th>
                <th className="p-3">Người ứng tiền</th>
                <th className="p-3">Ghi chú</th>
                <th className="p-3 text-right">Số tiền</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      <span>{exp.categoryIcon}</span> {exp.categoryName}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#3C50E0] font-semibold text-[11px]">
                      💳 {exp.paidByMemberName}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 italic">{exp.description || '—'}</td>
                  <td className="p-3 text-right font-extrabold text-slate-900">
                    {exp.amount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa khoản chi"
                    >
                      🗑 Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
