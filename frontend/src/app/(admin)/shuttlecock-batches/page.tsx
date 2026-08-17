'use client'

import { useEffect, useState } from 'react'
import { shuttlecockApi, ShuttlecockBatch } from '@/lib/api/shuttlecocks'
import { membersApi, Member } from '@/lib/api/members'

export default function ShuttlecockBatchesPage() {
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const [purchasedByMemberId, setPurchasedByMemberId] = useState<number | ''>('')
  const [quantityPurchased, setQuantityPurchased] = useState('12')
  const [totalCost, setTotalCost] = useState('325000')
  const [brand, setBrand] = useState('Thành Công')

  function load() {
    setLoading(true)
    Promise.all([
      shuttlecockApi.getBatches().then(setBatches),
      membersApi.getAll(true).then(setMembers),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!purchasedByMemberId || !quantityPurchased || !totalCost) return
    const q = Number(quantityPurchased)
    const t = Number(totalCost)
    await shuttlecockApi.createBatch({
      purchasedByMemberId: Number(purchasedByMemberId),
      purchaseDate: new Date().toISOString().split('T')[0],
      quantityPurchased: q,
      unitPrice: t / q,
      brand,
    })
    setShowAdd(false)
    load()
  }

  const totalRemaining = batches.reduce((sum, b) => sum + b.quantityRemaining, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Kho Cầu</h1>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi các tuýp cầu mua mới và số lượng tồn kho</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <span>➕</span> Nhập lô cầu mới
        </button>
      </div>

      {/* Overview Stat Card */}
      <div className="nextadmin-card p-5 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200">
        <div>
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Tổng tồn kho hiện tại</div>
          <div className="text-3xl font-extrabold text-amber-900 mt-1">{totalRemaining} quả cầu</div>
          <div className="text-xs text-amber-700 mt-0.5 font-medium">Sẵn sàng phân bổ tự động theo FIFO</div>
        </div>
        <div className="w-14 h-14 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-2xl shadow-md">
          🏸
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Đang tải dữ liệu kho cầu...</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">📦</div>
          <div className="font-semibold text-slate-700">Kho cầu hiện đang trống</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Nhập lô cầu đầu tiên để bắt đầu tính năng tự động trừ kho và tính đơn giá cầu cho mỗi buổi tập.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => {
            const percentRemaining = Math.round((b.quantityRemaining / b.quantityPurchased) * 100)
            return (
              <div key={b.id} className="nextadmin-card p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 text-base">Tuýp {b.brand || 'Cầu'}</div>
                    <div className="text-xs text-slate-500 font-medium">Người mua: {b.purchasedByMemberName}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#3C50E0] font-bold text-[11px]">
                    Lô #{b.id}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Số lượng tồn kho:</span>
                    <span>
                      {b.quantityRemaining} / {b.quantityPurchased} quả ({percentRemaining}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentRemaining > 30 ? 'bg-[#3C50E0]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
                  <div>
                    📅 Mua: <span className="font-semibold">{new Date(b.purchaseDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    Đơn giá: <span className="font-bold text-slate-900">{Math.round(b.unitPrice).toLocaleString('vi-VN')} đ/quả</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Batch Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Nhập lô cầu mới</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Người đứng ra mua *</label>
                <select
                  value={purchasedByMemberId}
                  onChange={(e) => setPurchasedByMemberId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm bg-white outline-none focus:border-[#3C50E0]"
                  required
                >
                  <option value="">Chọn hội viên...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số quả mua *</label>
                  <input
                    type="number"
                    value={quantityPurchased}
                    onChange={(e) => setQuantityPurchased(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng tiền (đ) *</label>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                    min="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thương hiệu / Loại cầu</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Thành Công, Yonex, Ba Sao..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3C50E0] hover:bg-[#3444B9] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
