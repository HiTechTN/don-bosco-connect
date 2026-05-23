import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { Absence } from '@/types'

export const absenceKeys = {
  all: ['absences'] as const,
  list: (params?: Record<string, unknown>) => ['absences', 'list', params] as const,
}

export function useAbsences(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: absenceKeys.list(params),
    queryFn: () => api.get<Absence[]>(`/absences${searchParams}`),
  })
}

export function useCreateAbsence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Absence>) => api.post<Absence>('/absences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}

export function useJustifyAbsence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, justification_text }: { id: string; justification_text: string }) =>
      api.patch<Absence>(`/absences/${id}/justify`, { justification_text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
