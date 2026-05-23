import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export const aiKeys = {
  conversations: ['ai', 'conversations'] as const,
  quiz: (params?: Record<string, unknown>) => ['ai', 'quiz', params] as const,
}

interface ChatRequest {
  message: string
  context_type?: string
  conversation_id?: string
}

interface ChatResponse {
  response: string
  conversation_id: string
}

interface QuizRequest {
  subject_id: string
  topic: string
  difficulty: string
  num_questions: number
}

interface QuizResponse {
  questions: unknown[]
  quiz_id: string
}

export function useAIChat() {
  return useMutation({
    mutationFn: (data: ChatRequest) =>
      api.post<ChatResponse>('/ai/chat', data),
  })
}

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: (data: QuizRequest) =>
      api.post<QuizResponse>('/ai/generate-quiz', data),
  })
}

export function useConversations() {
  return useQuery({
    queryKey: aiKeys.conversations,
    queryFn: () => api.get<unknown[]>('/ai/conversations'),
  })
}
