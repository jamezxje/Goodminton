import api from '@/lib/api'

export interface Session {
  id: number
  sessionDate: string
  startTime: string
  endTime: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  notes: string | null
  checkedInCount: number
}

export interface CreateSessionPayload {
  sessionDate: string
  startTime: string
  endTime: string
  notes?: string
}

export const sessionsApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/sessions', { params: { page, size } }).then((r) => r.data.data),
  create: (data: CreateSessionPayload) =>
    api.post('/sessions', data).then((r) => r.data.data),
  getById: (id: number) =>
    api.get(`/sessions/${id}`).then((r) => r.data.data),
  close: (id: number) =>
    api.patch(`/sessions/${id}/close`),
}
