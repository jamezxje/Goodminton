import api from '@/lib/api'

export interface Attendance {
  id: number
  memberId: number | null
  memberName: string | null
  guestName: string | null
  isCheckedIn: boolean
}

export const attendanceApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/attendances`).then((r) => r.data.data as Attendance[]),
  toggle: (sessionId: number, aId: number) =>
    api.patch(`/sessions/${sessionId}/attendances/${aId}/toggle`).then((r) => r.data.data as Attendance),
  addGuest: (sessionId: number, guestName: string) =>
    api.post(`/sessions/${sessionId}/attendances/guest`, { guestName }).then((r) => r.data.data as Attendance),
  deleteGuest: (sessionId: number, aId: number) =>
    api.delete(`/sessions/${sessionId}/attendances/${aId}`),
}
