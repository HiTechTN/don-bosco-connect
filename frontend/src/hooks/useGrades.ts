import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { Grade, Evaluation } from '@/types'

export const gradeKeys = {
  all: ['grades'] as const,
  list: (params?: Record<string, unknown>) => ['grades', 'list', params] as const,
  evaluations: (params?: Record<string, unknown>) => ['grades', 'evaluations', params] as const,
}

export function useGrades(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: gradeKeys.list(params),
    queryFn: () => api.get<Grade[]>(`/grades${searchParams}`),
  })
}

export function useEvaluations(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: gradeKeys.evaluations(params),
    queryFn: () => api.get<Evaluation[]>(`/grades/evaluations${searchParams}`),
  })
}

export function useCreateGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Grade>) => api.post<Grade>('/grades', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradeKeys.all }),
  })
}

export function useUpdateGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Grade> & { id: string }) =>
      api.put<Grade>(`/grades/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gradeKeys.all }),
  })
}
