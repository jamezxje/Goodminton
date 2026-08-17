import api from '@/lib/api'

export interface Obligation {
  id: number
  memberId: number | null
  memberName: string | null
  guestName: string | null
  totalShare: number
  prePaidAmount: number
  netAmount: number
  isSettled: boolean
  settledAt: string | null
}

export const obligationsApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/obligations`).then((r) => r.data.data as Obligation[]),
  confirm: (sessionId: number, oId: number) =>
    api.patch(`/sessions/${sessionId}/obligations/${oId}/confirm`).then((r) => r.data.data as Obligation),
}
