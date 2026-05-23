import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export const quizKeys = {
  all: ['quizzes'] as const,
  questions: (quizId: string) => ['quizzes', quizId] as const,
}

export function useQuizzes() {
  return useQuery({
    queryKey: quizKeys.all,
    queryFn: () => api.get<unknown[]>('/quizzes'),
  })
}

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.questions(quizId!),
    queryFn: () => api.get(`/quizzes/${quizId}/questions`),
    enabled: !!quizId,
  })
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: unknown }) =>
      api.post(`/quizzes/${quizId}/submit`, answers),
  })
}
