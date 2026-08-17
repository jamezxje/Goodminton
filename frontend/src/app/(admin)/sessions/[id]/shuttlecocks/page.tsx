'use client'

import { useEffect, useState, use } from 'react'
import { shuttlecockApi, ShuttlecockUsage, ShuttlecockBatch } from '@/lib/api/shuttlecocks'

export default function ShuttlecocksTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)

  const [usages, setUsages] = useState<ShuttlecockUsage[]>([])
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [loading, setLoading] = useState(true)

  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [autoQty, setAutoQty] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('')
  const [manualQty, setManualQty] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      shuttlecockApi.getUsages(sessionId).then(setUsages),
      shuttlecockApi.getAvailableBatches().then(setBatches),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [sessionId])

  async function handleAutoFifo(e: React.FormEvent) {
    e.preventDefault()
    if (!autoQty || Number(autoQty) <= 0) return
    await shuttlecockApi.autoFifo(sessionId, Number(autoQty))
    setAutoQty('')
    load()
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBatchId || !manualQty || Number(manualQty) <= 0) return
    await shuttlecockApi.manual(sessionId, [
      {
        batchId: Number(selectedBatchId),
        quantityUsed: Number(manualQty),
      },
    ])
    setManualQty('')
    load()
  }

  async function handleReset() {
    if (!confirm('Bạn có chắc muốn xóa tất cả phân bổ cầu trong buổi tập này?')) return
    await shuttlecockApi.reset(sessionId)
    load()
  }

  const totalUsed = usages.reduce((sum, u) => sum + u.quantityUsed, 0)
  const totalCost = usages.reduce((sum, u) => sum + u.subtotal, 0)

  return (
    <div className="nextadmin-card p-5 space-y-6">
      {/* Mode Switch Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Quản lý cầu sử dụng trong buổi tập</h3>
          <p className="text-xs text-slate-500 mt-0.5">Trừ kho cầu tự động theo FIFO hoặc chọn lô thủ công</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          <button
            onClick={() => setMode('auto')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'auto' ? 'bg-[#3C50E0] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Auto FIFO
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'manual' ? 'bg-[#3C50E0] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛠 Chọn lô thủ công
          </button>
        </div>
      </div>

      {/* Mode Form */}
      {mode === 'auto' ? (
        <form onSubmit={handleAutoFifo} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800">Tự động trừ kho theo thứ tự Lô cũ nhất (Auto FIFO)</h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={autoQty}
              onChange={(e) => setAutoQty(e.target.value)}
              placeholder="Tổng số quả cầu đã dùng (ví dụ: 6)..."
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs md:text-sm bg-white outline-none focus:border-[#3C50E0]"
              min="1"
              required
            />
            <button
              type="submit"
              className="bg-[#3C50E0] hover:bg-[#3444B9] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
            >
              Tính phân bổ Auto FIFO
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800">Thêm lượng cầu sử dụng từ một Lô cụ thể</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
                required
              >
                <option value="">Chọn lô cầu trong kho...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    Tuýp {b.brand} ({b.purchasedByMemberName}) — Còn {b.quantityRemaining}/{b.quantityPurchased} quả
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                value={manualQty}
                onChange={(e) => setManualQty(e.target.value)}
                placeholder="Số quả dùng..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-[#3C50E0]"
                min="1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#3C50E0] hover:bg-[#3444B9] text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors"
          >
            Lưu lượng cầu dùng
          </button>
        </form>
      )}

      {/* Allocation Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Chi tiết phân bổ ({totalUsed} quả cầu)
          </h4>
          {usages.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              🔄 Reset phân bổ
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Đang tải phân bổ cầu...</div>
        ) : usages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có phân bổ cầu nào cho buổi tập này
          </div>
        ) : (
          <div className="space-y-2">
            {usages.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Tuýp cầu của {u.purchasedByMemberName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {u.quantityUsed} quả × {u.unitPriceSnapshot?.toLocaleString('vi-VN')} đ/quả
                  </div>
                </div>
                <div className="text-right font-extrabold text-slate-900">
                  {u.subtotal?.toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 mt-3">
              <span>Tổng tiền cầu dùng:</span>
              <span className="text-sm text-amber-700 font-extrabold">{totalCost.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
