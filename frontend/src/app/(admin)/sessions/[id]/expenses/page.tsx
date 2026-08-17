'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { expensesApi, SessionExpense, ExpenseCategory } from '@/lib/api/expenses'
import { membersApi, Member } from '@/lib/api/members'

export default function ExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)
  const [expenses, setExpenses] = useState<SessionExpense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '', paidByMemberId: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [exp, cats, mems] = await Promise.all([
        expensesApi.getAll(sessionId),
        expensesApi.getCategories(),
        membersApi.getAll(true),
      ])
      setExpenses(exp)
      setCategories(cats)
      setMembers(mems)
    } catch {
      // ignore
    }
  }, [sessionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await expensesApi.add(sessionId, {
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        paidByMemberId: Number(form.paidByMemberId),
        description: form.description || undefined,
      })
      setShowForm(false)
      setForm({ categoryId: '', amount: '', paidByMemberId: '', description: '' })
      loadData()
    } catch {
      alert('Thêm khoản chi thất bại!')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(eId: number) {
    if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) return
    try {
      await expensesApi.delete(sessionId, eId)
      loadData()
    } catch {
      alert('Xóa khoản chi thất bại!')
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border">
        <span className="text-sm text-gray-600">Tổng chi buổi tập:</span>
        <span className="text-base font-bold text-gray-900">{totalAmount.toLocaleString('vi-VN')}đ</span>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors"
      >
        {showForm ? 'Hủy' : '+ Thêm khoản chi'}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl p-4 border space-y-3 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục chi</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền (đ)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
              placeholder="100000"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Người ứng tiền</label>
            <select
              value={form.paidByMemberId}
              onChange={(e) => setForm((f) => ({ ...f, paidByMemberId: e.target.value }))}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ví dụ: 3 chai nước ngọt..."
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Lưu khoản chi'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border text-sm">
            Chưa có khoản chi nào trong buổi này
          </div>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>{e.categoryIcon}</span> {e.categoryName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💳 <b>{e.paidByMemberName}</b> ứng tiền
                </div>
                {e.description && <div className="text-xs text-gray-400 mt-0.5">📝 {e.description}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">{Number(e.amount).toLocaleString('vi-VN')}đ</span>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                  title="Xóa khoản chi"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
