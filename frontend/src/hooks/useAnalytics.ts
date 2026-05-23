import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { AnalyticsDashboard, AnalyticsGrades, AnalyticsAIUsage, AnalyticsQuizStats } from '@/types'

export const analyticsKeys = {
  dashboard: ['analytics', 'dashboard'] as const,
  grades: (params?: Record<string, unknown>) => ['analytics', 'grades', params] as const,
  aiUsage: ['analytics', 'ai-usage'] as const,
  quizStats: ['analytics', 'quiz-stats'] as const,
}

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: () => api.get<AnalyticsDashboard>('/analytics/dashboard'),
  })
}

export function useAnalyticsGrades(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: analyticsKeys.grades(params),
    queryFn: () => api.get<AnalyticsGrades>(`/analytics/grades${searchParams}`),
  })
}

export function useAnalyticsAIUsage() {
  return useQuery({
    queryKey: analyticsKeys.aiUsage,
    queryFn: () => api.get<AnalyticsAIUsage>('/analytics/ai-usage'),
  })
}

export function useAnalyticsQuizStats() {
  return useQuery({
    queryKey: analyticsKeys.quizStats,
    queryFn: () => api.get<AnalyticsQuizStats>('/analytics/quiz-stats'),
  })
}
