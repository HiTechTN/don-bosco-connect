import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { GamificationProfile, Badge, LeaderboardEntry, XPHistory } from '@/types'

export const gamificationKeys = {
  profile: (studentId?: string) => ['gamification', 'profile', studentId] as const,
  badges: ['gamification', 'badges'] as const,
  leaderboard: (params?: Record<string, unknown>) => ['gamification', 'leaderboard', params] as const,
  xpHistory: ['gamification', 'xp'] as const,
}

export function useGamificationProfile(studentId?: string) {
  const path = studentId ? `/gamification/profile/${studentId}` : '/gamification/profile'
  return useQuery({
    queryKey: gamificationKeys.profile(studentId),
    queryFn: () => api.get<GamificationProfile>(path),
  })
}

export function useBadges() {
  return useQuery({
    queryKey: gamificationKeys.badges,
    queryFn: () => api.get<Badge[]>('/gamification/badges'),
  })
}

export function useLeaderboard(params?: Record<string, unknown>) {
  const searchParams = params ? '?' + new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString() : ''

  return useQuery({
    queryKey: gamificationKeys.leaderboard(params),
    queryFn: () => api.get<LeaderboardEntry[]>(`/gamification/leaderboard${searchParams}`),
  })
}

export function useXPHistory() {
  return useQuery({
    queryKey: gamificationKeys.xpHistory,
    queryFn: () => api.get<XPHistory[]>('/gamification/xp-history'),
  })
}
