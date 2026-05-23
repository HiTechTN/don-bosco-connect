import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { AuditLog } from '@/types'

export const auditLogKeys = {
  all: ['audit-logs'] as const,
}

export function useAuditLogs(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: auditLogKeys.all,
    queryFn: () => api.get<AuditLog[]>(`/audit-logs${searchParams}`),
  })
}
