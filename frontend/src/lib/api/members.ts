import api from '@/lib/api'

export interface Member {
  id: number
  fullName: string
  phone: string
  email: string | null
  avatarUrl: string | null
  isActive: boolean
  joinedDate: string
}

export const membersApi = {
  getAll: (active?: boolean) =>
    api.get('/members', { params: active !== undefined ? { active } : {} }).then((r) => r.data.data as Member[]),
  create: (data: { fullName: string; phone: string; email?: string; joinedDate: string }) =>
    api.post('/members', data).then((r) => r.data.data as Member),
  setStatus: (id: number, active: boolean) =>
    api.patch(`/members/${id}/status`, { active }),
}
