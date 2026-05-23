import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { User } from '@/types'

interface LoginRequest {
  email: string
  password: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<User>('/auth/me'),
    enabled: !!localStorage.getItem('access_token'),
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<TokenResponse>('/auth/login', data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      qc.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', {}),
    onSettled: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      qc.clear()
      window.location.href = '/login'
    },
  })
}
