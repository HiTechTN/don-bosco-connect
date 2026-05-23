import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { MessageThread, Message } from '@/types'

export const messageKeys = {
  all: ['messages'] as const,
  threads: ['messages', 'threads'] as const,
  thread: (id: string) => ['messages', 'thread', id] as const,
}

export function useMessageThreads() {
  return useQuery({
    queryKey: messageKeys.threads,
    queryFn: () => api.get<MessageThread[]>('/messages/threads'),
  })
}

export function useThreadMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.thread(threadId!),
    queryFn: () => api.get<Message[]>(`/messages/threads/${threadId}`),
    enabled: !!threadId,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      api.post<Message>(`/messages/threads/${threadId}`, { content }),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: messageKeys.thread(vars.threadId) }),
  })
}

export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { subject: string; recipient_id: string }) =>
      api.post<MessageThread>('/messages/threads', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: messageKeys.threads }),
  })
}
