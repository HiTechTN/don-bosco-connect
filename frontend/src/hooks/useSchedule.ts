import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { TimetableSlot } from '@/types'

export const scheduleKeys = {
  all: ['schedule'] as const,
  list: (params?: Record<string, unknown>) => ['schedule', 'list', params] as const,
}

export function useSchedule(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => api.get<TimetableSlot[]>(`/schedule${searchParams}`),
  })
}
