import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { User } from '@/types'

export const userKeys = {
  all: ['users'] as const,
  list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
}

export function useUsers(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => api.get<User[]>(`/users${searchParams}`),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<User>) => api.post<User>('/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
