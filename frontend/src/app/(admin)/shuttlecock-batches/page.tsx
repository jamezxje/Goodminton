'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { ShuttlecockBatch } from '@/lib/api/shuttlecocks'
import { membersApi, Member } from '@/lib/api/members'

export default function ShuttlecockBatchesPage() {
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    purchasedByMemberId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantityPurchased: '12',
    totalPrice: '',
    brand: 'Thành Công',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bList, mList] = await Promise.all([
        api.get('/shuttlecock-batches').then((r) => r.data.data as ShuttlecockBatch[]),
        membersApi.getAll(true),
      ])
      setBatches(bList)
      setMembers(mList)
    } catch {
      setBatches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/shuttlecock-batches', {
        purchasedByMemberId: Number(form.purchasedByMemberId),
        purchaseDate: form.purchaseDate,
        quantityPurchased: Number(form.quantityPurchased),
        totalPrice: Number(form.totalPrice),
        brand: form.brand.trim() || undefined,
      })
      setOpenModal(false)
      setForm({
        purchasedByMemberId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        quantityPurchased: '12',
        totalPrice: '',
        brand: 'Thành Công',
      })
      loadData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || 'Nhập kho cầu thất bại!')
    } finally {
      setSubmitting(false)
    }
  }

  const totalRemaining = batches.reduce((sum, b) => sum + b.quantityRemaining, 0)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho Cầu</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng tồn kho: <b>{totalRemaining}</b> quả cầu</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
        >
          + Nhập lô mới
        </button>
      </div>

      {/* Add Batch Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Nhập lô cầu mới</h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đứng ra mua *</label>
                <select
                  value={form.purchasedByMemberId}
                  onChange={(e) => setForm((f) => ({ ...f, purchasedByMemberId: e.target.value }))}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn hội viên...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số quả mua *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantityPurchased}
                    onChange={(e) => setForm((f) => ({ ...f, quantityPurchased: e.target.value }))}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền (đ) *</label>
                  <input
                    type="number"
                    min="1000"
                    value={form.totalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, totalPrice: e.target.value }))}
                    required
                    placeholder="325000"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu / Loại cầu</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="Thành Công..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                  {submitting ? 'Đang lưu...' : 'Nhập kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batches List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải danh sách kho cầu...</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">Chưa có lô cầu nào trong kho</div>
      ) : (
        <div className="space-y-3">
          {batches.map((b) => {
            const isEmpty = b.quantityRemaining === 0
            return (
              <div
                key={b.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  isEmpty ? 'opacity-50 bg-gray-50' : 'hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Tuýp cầu của {b.purchasedByMemberName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📅 Mua ngày {new Date(b.purchaseDate).toLocaleDateString('vi-VN')} · {b.brand || 'Thành Công'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Đơn giá: {Number(b.unitPrice).toLocaleString('vi-VN')}đ/quả
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isEmpty ? 'text-gray-400' : 'text-green-600'
                      }`}
                    >
                      {isEmpty ? 'Đã dùng hết' : `Còn ${b.quantityRemaining} / ${b.quantityPurchased} quả`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
