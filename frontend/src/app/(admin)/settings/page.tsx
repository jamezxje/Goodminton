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

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải cài đặt...</div>

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt CLB</h1>
        <p className="text-sm text-gray-500 mt-0.5">Thông tin tài khoản nhận tiền & QR Code</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên CLB</label>
          <input
            type="text"
            value={settings.club_name || ''}
            onChange={(e) => setSettings((s) => ({ ...s, club_name: e.target.value }))}
            placeholder="CLB Cầu lông Goodminton"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Ngân hàng</label>
          <input
            type="text"
            value={settings.bank_name || ''}
            onChange={(e) => setSettings((s) => ({ ...s, bank_name: e.target.value }))}
            placeholder="MB Bank, Vietcombank..."
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
          <input
            type="text"
            value={settings.account_number || ''}
            onChange={(e) => setSettings((s) => ({ ...s, account_number: e.target.value }))}
            placeholder="0357286401..."
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
          <input
            type="text"
            value={settings.account_holder || ''}
            onChange={(e) => setSettings((s) => ({ ...s, account_holder: e.target.value }))}
            placeholder="NGUYEN VAN A"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t pt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ảnh QR Thanh toán</label>
          {settings.qr_image_url && (
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <img
                src={
                  settings.qr_image_url.startsWith('/')
                    ? `http://localhost:8080${settings.qr_image_url}`
                    : settings.qr_image_url
                }
                alt="QR Code Preview"
                className="w-40 h-40 mx-auto object-contain"
              />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Đang upload ảnh...' : '📷 Upload / Thay ảnh QR'}
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </form>
    </div>
  )
}
