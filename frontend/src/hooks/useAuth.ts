import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { User } from '@/types'

interface LoginRequest {
  email: string
  password: string
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<User>('/auth/me'),
    retry: false, // Don't retry if not authenticated (cookie missing)
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<{ user: User }>('/auth/login', data),
    onSuccess: () => {
      // Server sets HttpOnly cookies; invalidate to refetch user
      qc.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', {}),
    onSettled: () => {
      qc.clear()
      window.location.href = '/login'
    },
  })
}
