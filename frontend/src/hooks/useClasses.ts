import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export const classKeys = {
  all: ['classes'] as const,
}

export function useClasses() {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: () => api.get<unknown[]>('/classes'),
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/classes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.put(`/classes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  })
}
