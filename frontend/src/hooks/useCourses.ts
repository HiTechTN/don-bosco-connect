import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { Course } from '@/types'

export const courseKeys = {
  all: ['courses'] as const,
}

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: () => api.get<Course[]>('/courses'),
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Course>) => api.post<Course>('/courses', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Course> & { id: string }) =>
      api.put<Course>(`/courses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  })
}
