'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { shuttlecockApi, ShuttlecockUsage, ShuttlecockBatch } from '@/lib/api/shuttlecocks'

export default function ShuttlecocksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)
  const [usages, setUsages] = useState<ShuttlecockUsage[]>([])
  const [batches, setBatches] = useState<ShuttlecockBatch[]>([])
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [autoQty, setAutoQty] = useState('')
  const [manualQtys, setManualQtys] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [uList, bList] = await Promise.all([
        shuttlecockApi.getUsages(sessionId),
        shuttlecockApi.getAvailableBatches(),
      ])
      setUsages(uList)
      setBatches(bList)
      const initialMap: Record<number, string> = {}
      bList.forEach((b) => {
        initialMap[b.id] = '0'
      })
      setManualQtys(initialMap)
    } catch {
      // ignore
    }
  }, [sessionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleAutoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!autoQty || Number(autoQty) <= 0) return
    setSubmitting(true)
    try {
      const res = await shuttlecockApi.autoFifo(sessionId, Number(autoQty))
      setUsages(res)
      loadData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || 'Lỗi khi tính FIFO tự động!')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const items = Object.entries(manualQtys)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([bId, qty]) => ({ batchId: Number(bId), quantityUsed: Number(qty) }))

      if (items.length === 0) {
        alert('Vui lòng nhập số quả sử dụng cho ít nhất 1 lô!')
        setSubmitting(false)
        return
      }

      const res = await shuttlecockApi.manual(sessionId, items)
      setUsages(res)
      loadData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg || 'Phân bổ thủ công thất bại!')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset() {
    if (!confirm('Xóa phân bổ cầu cho buổi này?')) return
    try {
      await shuttlecockApi.reset(sessionId)
      loadData()
    } catch {
      alert('Reset cầu thất bại!')
    }
  }

  const totalCost = usages.reduce((sum, u) => sum + Number(u.subtotal), 0)
  const totalUsed = usages.reduce((sum, u) => sum + u.quantityUsed, 0)

  return (
    <div className="space-y-4">
      {/* Mode switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMode('auto')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          ⚡ Chế độ nhanh (Auto FIFO)
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          🛠 Chế độ chi tiết (Chọn lô)
        </button>
      </div>

      {mode === 'auto' ? (
        <form onSubmit={handleAutoSubmit} className="bg-white rounded-xl p-4 border space-y-3 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tổng số quả sử dụng hôm nay</label>
            <input
              type="number"
              min="1"
              value={autoQty}
              onChange={(e) => setAutoQty(e.target.value)}
              placeholder="Ví dụ: 10"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Đang tính FIFO...' : 'Tính phân bổ Auto FIFO'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          {batches.length === 0 ? (
            <div className="text-center py-6 text-gray-400 bg-white rounded-xl border text-sm">
              Kho hiện không còn lô cầu nào khả dụng
            </div>
          ) : (
            batches.map((b) => (
              <div key={b.id} className="bg-white rounded-xl p-3.5 border space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Tuýp của {b.purchasedByMemberName}</div>
                    <div className="text-xs text-gray-500">
                      📅 {new Date(b.purchaseDate).toLocaleDateString('vi-VN')} · Còn <b>{b.quantityRemaining}</b> quả
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {Number(b.unitPrice).toLocaleString('vi-VN')}đ/quả
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={b.quantityRemaining}
                  value={manualQtys[b.id] ?? '0'}
                  onChange={(e) => setManualQtys((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))
          )}
          {batches.length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu phân bổ thủ công'}
            </button>
          )}
        </form>
      )}

      {/* Result usages list */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Chi tiết phân bổ ({totalUsed} quả):
          </span>
          {usages.length > 0 && (
            <button onClick={handleReset} className="text-xs text-red-500 hover:underline">
              Reset phân bổ
            </button>
          )}
        </div>

        {usages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border text-sm">
            Chưa phân bổ cầu cho buổi này
          </div>
        ) : (
          usages.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border p-3.5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-gray-900">Tuýp của {u.purchasedByMemberName}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {u.quantityUsed} quả × {Number(u.unitPriceSnapshot).toLocaleString('vi-VN')}đ
                </div>
              </div>
              <span className="font-bold text-gray-900 text-sm">{Number(u.subtotal).toLocaleString('vi-VN')}đ</span>
            </div>
          ))
        )}

        {usages.length > 0 && (
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex justify-between items-center text-sm">
            <span className="font-medium text-blue-900">Tổng tiền cầu:</span>
            <span className="font-bold text-blue-900">{totalCost.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </div>
    </div>
  )
}
