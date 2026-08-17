import api from '@/lib/api'

export interface ShuttlecockUsage {
  id: number
  batchId: number
  purchasedByMemberName: string
  purchaseDate: string
  quantityUsed: number
  unitPriceSnapshot: number
  subtotal: number
}

export interface ShuttlecockBatch {
  id: number
  purchasedByMemberId: number
  purchasedByMemberName: string
  purchaseDate: string
  quantityPurchased: number
  quantityRemaining: number
  unitPrice: number
  brand: string | null
}

export const shuttlecockApi = {
  getUsages: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/shuttlecock-usage`).then((r) => r.data.data as ShuttlecockUsage[]),
  autoFifo: (sessionId: number, totalQuantityUsed: number) =>
    api.post(`/sessions/${sessionId}/shuttlecock-usage/auto`, { totalQuantityUsed }).then((r) => r.data.data as ShuttlecockUsage[]),
  manual: (sessionId: number, usages: { batchId: number; quantityUsed: number }[]) =>
    api.post(`/sessions/${sessionId}/shuttlecock-usage/manual`, { usages }).then((r) => r.data.data as ShuttlecockUsage[]),
  reset: (sessionId: number) =>
    api.delete(`/sessions/${sessionId}/shuttlecock-usage`),
  getAvailableBatches: () =>
    api.get('/shuttlecock-batches/available').then((r) => r.data.data as ShuttlecockBatch[]),
}
