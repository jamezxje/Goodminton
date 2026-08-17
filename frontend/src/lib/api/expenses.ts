import api from '@/lib/api'

export interface SessionExpense {
  id: number
  categoryId: number
  categoryName: string
  categoryIcon: string
  amount: number
  paidByMemberId: number
  paidByMemberName: string
  description: string | null
}

export interface ExpenseCategory {
  id: number
  name: string
  icon: string
}

export const expensesApi = {
  getAll: (sessionId: number) =>
    api.get(`/sessions/${sessionId}/expenses`).then((r) => r.data.data as SessionExpense[]),
  add: (sessionId: number, data: { categoryId: number; amount: number; paidByMemberId: number; description?: string }) =>
    api.post(`/sessions/${sessionId}/expenses`, data).then((r) => r.data.data as SessionExpense),
  delete: (sessionId: number, eId: number) =>
    api.delete(`/sessions/${sessionId}/expenses/${eId}`),
  getCategories: () =>
    api.get('/expense-categories').then((r) => r.data.data as ExpenseCategory[]),
}
