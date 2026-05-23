import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export const subjectKeys = {
  all: ['subjects'] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.all,
    queryFn: () => api.get<unknown[]>('/subjects'),
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/subjects', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.put(`/subjects/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all }),
  })
}
