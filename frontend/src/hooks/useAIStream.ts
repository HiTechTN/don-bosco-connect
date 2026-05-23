import { useState, useCallback, useRef } from 'react'

interface StreamState {
  content: string
  isStreaming: boolean
  error: string | null
}

export function useAIStream() {
  const [state, setState] = useState<StreamState>({
    content: '',
    isStreaming: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string, contextType = 'general') => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState({ content: '', isStreaming: true, error: null })

    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, context_type: contextType }),
        signal: abortRef.current.signal,
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.done) {
            setState(s => ({ ...s, isStreaming: false }))
            return
          }
          if (data.error) throw new Error(data.error)
          if (data.token) {
            setState(s => ({ ...s, content: s.content + data.token }))
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(s => ({ ...s, isStreaming: false, error: err.message }))
      }
    }
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState(s => ({ ...s, isStreaming: false }))
  }, [])

  return { ...state, sendMessage, abort }
}
