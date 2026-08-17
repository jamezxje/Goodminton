'use client'

import { useEffect, useState, useRef, use } from 'react'
import { obligationsApi, Obligation } from '@/lib/api/obligations'
import api from '@/lib/api'

export default function ObligationsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sessionId = Number(id)

  const [obligations, setObligations] = useState<Obligation[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string>('')
  const [clubName, setClubName] = useState<string>('')
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountHolder: '' })

  const fileRef = useRef<HTMLInputElement>(null)

  function load() {
    setLoading(true)
    Promise.all([
      obligationsApi.getAll(sessionId).then(setObligations).catch(() => setObligations([])),
      api.get('/settings').then((res) => {
        const d = res.data.data
        if (d) {
          setQrImageUrl(d.qr_image_url || '')
          setClubName(d.club_name || 'CLB Cầu lông Goodminton')
          setBankInfo({
            bankName: d.bank_name || '',
            accountNumber: d.account_number || '',
            accountHolder: d.account_holder || '',
          })
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [sessionId])

  async function handleConfirm(obId: number) {
    setConfirmingId(obId)
    try {
      await obligationsApi.confirm(sessionId, obId)
      load()
    } catch {
      alert('Không thể gạch nợ!')
    } finally {
      setConfirmingId(null)
    }
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/settings/qr-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setQrImageUrl(res.data.data)
      alert('Upload ảnh QR thành công!')
    } catch {
      alert('Upload thất bại!')
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-sm">Đang tải bảng chia tiền...</div>
  }

  if (!obligations || obligations.length === 0) {
    return (
      <div className="nextadmin-card p-8 text-center space-y-3">
        <div className="text-4xl">🧾</div>
        <div className="font-bold text-slate-800 text-base">Buổi tập chưa được chốt</div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Vui lòng chuyển trạng thái buổi tập sang <strong>🔒 Chốt buổi tập</strong> ở thanh trên để hệ thống tự động tính toán nghĩa vụ đóng tiền.
        </p>
      </div>
    )
  }

  const perPersonShare = obligations[0]?.totalShare || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Obligation Details Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="nextadmin-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bảng tổng hợp nghĩa vụ đóng tiền</h3>
              <p className="text-xs text-slate-500">Chi phí bình quân mỗi người đi tập</p>
            </div>
            <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-xs font-bold text-[#3C50E0]">
              <span>Bình quân: </span>
              <span className="text-sm font-extrabold">{perPersonShare.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Obligations List */}
          <div className="divide-y divide-slate-100">
            {obligations.map((ob) => {
              const name = ob.memberName || ob.guestName || ''
              const isGuest = !!ob.guestName
              const isPayer = ob.netAmount < 0
              const isSettled = ob.isSettled
              return (
                <div key={ob.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{name}</span>
                      {isGuest && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold text-[10px]">
                          Khách vãng lai
                        </span>
                      )}
                    </div>
                    {ob.prePaidAmount > 0 && (
                      <div className="text-[11px] text-slate-500">
                        Đã ứng trước: <span className="font-semibold text-slate-700">{ob.prePaidAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      {isPayer ? (
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          ← Nhận lại từ TQ: {Math.abs(ob.netAmount).toLocaleString('vi-VN')} đ
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                          → Cần chuyển: {ob.netAmount.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>

                    {!isPayer && (
                      <div>
                        {isSettled ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs inline-flex items-center gap-1 shadow-sm">
                            ✓ Đã xong
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirm(ob.id)}
                            disabled={confirmingId === ob.id}
                            className="bg-[#3C50E0] hover:bg-[#3444B9] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                          >
                            {confirmingId === ob.id ? 'Đang gạch...' : 'Gạch nợ (Đã thu)'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right 1 Col: Payment QR & Bank Details */}
      <div className="space-y-4">
        <div className="nextadmin-card p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            💳 Mã QR Thanh toán CLB
          </h3>

          <div className="text-center space-y-3">
            {qrImageUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-sm">
                <img
                  src={qrImageUrl.startsWith('/') ? `http://localhost:8080${qrImageUrl}` : qrImageUrl}
                  alt="QR Code"
                  className="w-48 h-48 object-contain mx-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <div className="text-3xl">📷</div>
                <div className="text-xs text-slate-400">Chưa có ảnh QR Code thanh toán</div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors"
            >
              📷 Upload / Thay ảnh QR
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
            <div className="font-bold text-slate-900">{clubName}</div>
            {bankInfo.bankName && (
              <div>
                Ngân hàng: <span className="font-semibold">{bankInfo.bankName}</span>
              </div>
            )}
            {bankInfo.accountNumber && (
              <div>
                STK: <span className="font-bold text-[#3C50E0]">{bankInfo.accountNumber}</span>
              </div>
            )}
            {bankInfo.accountHolder && (
              <div>
                Chủ TK: <span className="font-semibold uppercase">{bankInfo.accountHolder}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
