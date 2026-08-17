'use client'

import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api
      .get('/settings')
      .then((r) => setSettings(r.data.data))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/settings', settings)
      alert('Đã lưu cài đặt thành công!')
    } catch {
      alert('Lưu cài đặt thất bại!')
    } finally {
      setSaving(false)
    }
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/settings/qr-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSettings((prev) => ({ ...prev, qr_image_url: res.data.data }))
      alert('Upload ảnh QR thành công!')
    } catch {
      alert('Upload ảnh QR thất bại!')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-sm">Đang tải cài đặt CLB...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt CLB</h1>
        <p className="text-xs text-slate-500 mt-0.5">Cấu hình tên CLB, tài khoản ngân hàng và mã QR thanh toán</p>
      </div>

      <form onSubmit={handleSave} className="nextadmin-card p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Thông tin tài khoản nhận chuyển khoản</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên CLB</label>
            <input
              type="text"
              value={settings.club_name || ''}
              onChange={(e) => setSettings((s) => ({ ...s, club_name: e.target.value }))}
              placeholder="CLB Cầu lông Goodminton"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Ngân hàng</label>
              <input
                type="text"
                value={settings.bank_name || ''}
                onChange={(e) => setSettings((s) => ({ ...s, bank_name: e.target.value }))}
                placeholder="MB Bank, Vietcombank..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số tài khoản</label>
              <input
                type="text"
                value={settings.account_number || ''}
                onChange={(e) => setSettings((s) => ({ ...s, account_number: e.target.value }))}
                placeholder="0357286401..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chủ tài khoản</label>
            <input
              type="text"
              value={settings.account_holder || ''}
              onChange={(e) => setSettings((s) => ({ ...s, account_holder: e.target.value }))}
              placeholder="NGUYEN VAN A"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm outline-none focus:border-[#3C50E0]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Mã QR Code Thanh toán</label>
            {settings.qr_image_url && (
              <div className="text-center p-4 border border-slate-200 rounded-2xl bg-slate-50">
                <img
                  src={
                    settings.qr_image_url.startsWith('/')
                      ? `http://localhost:8080${settings.qr_image_url}`
                      : settings.qr_image_url
                  }
                  alt="QR Code Preview"
                  className="w-48 h-48 mx-auto object-contain rounded-lg"
                />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Đang upload ảnh...' : '📷 Upload / Thay ảnh QR Thanh toán'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#3C50E0] hover:bg-[#3444B9] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          {saving ? 'Đang lưu cài đặt...' : 'Lưu cài đặt'}
        </button>
      </form>
    </div>
  )
}
