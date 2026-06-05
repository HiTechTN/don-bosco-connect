import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

// ── Types ───────────────────────────────────────────────────────

export interface PublicAnnouncement {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string | null
  cover_image_url: string | null
  category: string
  tags: string[]
  pinned: boolean
  views_count: number
  publish_at: string | null
  created_at: string | null
  reactions: Record<string, number> | null
}

export interface AdminAnnouncement extends PublicAnnouncement {
  title_ar: string | null
  excerpt_ar: string | null
  content_json: Record<string, unknown>
  status: string
  visibility: string
  allowed_roles: string[]
  priority: number
  attachments: unknown[]
  created_by: string | null
  updated_at: string | null
}

export interface AnnouncementListResponse {
  items: (PublicAnnouncement | AdminAnnouncement)[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface AnnouncementCreateInput {
  title: string
  title_ar?: string
  excerpt?: string
  content_json?: Record<string, unknown>
  category?: string
  tags?: string[]
  visibility?: string
  pinned?: boolean
  priority?: number
  publish_at?: string
  status?: string
}

// ── Query keys ──────────────────────────────────────────────────

export const announcementKeys = {
  all: ['announcements'] as const,
  publicList: (params?: Record<string, unknown>) => ['announcements', 'public', 'list', params] as const,
  publicDetail: (slug: string) => ['announcements', 'public', 'detail', slug] as const,
  adminList: (params?: Record<string, unknown>) => ['announcements', 'admin', 'list', params] as const,
  adminDetail: (id: string) => ['announcements', 'admin', 'detail', id] as const,
}

// ── Public hooks (no auth required) ─────────────────────────────

export function usePublicAnnouncements(params?: {
  per_page?: number
  category?: string
  q?: string
  page?: number
}) {
  return useQuery({
    queryKey: announcementKeys.publicList(params),
    queryFn: () =>
      api.get<AnnouncementListResponse>('/public/announcements', { params }),
    staleTime: 60_000,
  })
}

export function usePublicAnnouncement(slug: string | undefined) {
  return useQuery({
    queryKey: announcementKeys.publicDetail(slug ?? ''),
    queryFn: () =>
      api.get<PublicAnnouncement>(`/public/announcements/${slug}`),
    enabled: !!slug,
  })
}

// ── Admin hooks (auth required) ─────────────────────────────────

export function useAdminAnnouncements(params?: {
  status?: string
  category?: string
  q?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: announcementKeys.adminList(params),
    queryFn: () =>
      api.get<AnnouncementListResponse>('/announcements', { params }),
  })
}

export function useAdminAnnouncement(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: announcementKeys.adminDetail(id ?? ''),
    queryFn: () =>
      api.get<AdminAnnouncement>(`/announcements/${id}`),
    enabled: enabled && !!id,
  })
}

// ── Admin mutations ─────────────────────────────────────────────

export function useCreateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AnnouncementCreateInput) =>
      api.post<AdminAnnouncement>('/announcements', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: announcementKeys.all }),
  })
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AnnouncementCreateInput> & { id: string }) =>
      api.patch<AdminAnnouncement>(`/announcements/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: announcementKeys.all }),
  })
}

export function usePublishAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post<AdminAnnouncement>(`/announcements/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: announcementKeys.all }),
  })
}

export function useArchiveAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post<AdminAnnouncement>(`/announcements/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: announcementKeys.all }),
  })
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: announcementKeys.all }),
  })
}
