'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { obligationsApi, Obligation } from '@/lib/api/obligations'
import api from '@/lib/api'

export default function ObligationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const obs = await obligationsApi.getAll(sessionId)
      setObligations(obs)
      const settingsRes = await api.get('/settings')
      const settings = settingsRes.data.data as Record<string, string>
      setQrUrl(settings.qr_image_url || null)
    } catch {
      setObligations([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleConfirm(oId: number) {
    try {
      const updated = await obligationsApi.confirm(sessionId, oId)
      setObligations((prev) => prev.map((o) => (o.id === oId ? updated : o)))
    } catch {
      alert('Gạch nợ thất bại!')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải bảng chia tiền...</div>

  if (obligations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white rounded-xl border p-6 space-y-2">
        <p className="font-semibold text-gray-700">Chưa có dữ liệu chia tiền</p>
        <p className="text-xs text-gray-500">Hãy nhấn nút "Chốt buổi" ở phía trên để hệ thống tự động tính toán.</p>
      </div>
    )
  }

  const sharePerPerson = obligations[0]?.totalShare ?? 0

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex justify-between items-center text-sm">
        <span className="font-medium text-blue-900">Chi phí mỗi người:</span>
        <span className="font-bold text-blue-900">{Number(sharePerPerson).toLocaleString('vi-VN')}đ</span>
      </div>

      <div className="space-y-2">
        {obligations.map((o) => {
          const name = o.memberName ?? o.guestName ?? 'Khách'
          const net = Number(o.netAmount)
          const isDebtor = net > 0

          return (
            <div
              key={o.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                o.isSettled ? 'opacity-60 bg-gray-50' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {name}
                    {!o.memberName && <span className="text-xs font-normal text-amber-600">(Khách)</span>}
                  </div>
                  {Number(o.prePaidAmount) > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Đã ứng trước: {Number(o.prePaidAmount).toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  <div
                    className={`text-sm font-bold mt-1.5 ${
                      isDebtor ? 'text-red-600' : net === 0 ? 'text-gray-600' : 'text-green-600'
                    }`}
                  >
                    {isDebtor
                      ? `→ Cần chuyển: ${net.toLocaleString('vi-VN')}đ`
                      : net === 0
                      ? '✓ Đã hòa tiền'
                      : `← Nhận lại từ TQ: ${Math.abs(net).toLocaleString('vi-VN')}đ`}
                  </div>
                </div>

                <div>
                  {o.isSettled ? (
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
                      ✓ Đã xong
                    </span>
                  ) : (
                    isDebtor && (
                      <button
                        onClick={() => handleConfirm(o.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Gạch nợ (Đã thu)
                      </button>
                    )
                  )}
                </div>
              </div>

              {!o.isSettled && isDebtor && (
                <div className="mt-3 pt-2.5 border-t text-xs text-gray-500 flex justify-between items-center">
                  <span>Nội dung CK:</span>
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    GDM S{sessionId} M{o.memberId ?? 'G'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div className="bg-white rounded-xl border p-4 text-center space-y-2">
          <div className="text-sm font-semibold text-gray-800">QR Thanh toán CLB</div>
          <img
            src={qrUrl.startsWith('/') ? `http://localhost:8080${qrUrl}` : qrUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto object-contain rounded-lg border p-1"
          />
        </div>
      )}
    </div>
  )
}
