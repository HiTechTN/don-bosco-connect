import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

type WSMessage = {
  type: 'notification' | 'grade' | 'absence' | 'message' | 'ping'
  payload?: unknown
}

export function useWebSocket(userId: string | undefined) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>()
  const retriesRef = useRef(0)
  const qc = useQueryClient()
  const connectRef = useRef<() => void>()

  connectRef.current = () => {
    if (!userId) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'}/v1/notifications?token=${token}`
    ws.current = new WebSocket(wsUrl)

    ws.current.onmessage = (event) => {
      let msg: WSMessage
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }
      if (msg.type === 'ping') return

      if (msg.type === 'grade') qc.invalidateQueries({ queryKey: ['grades'] })
      if (msg.type === 'absence') qc.invalidateQueries({ queryKey: ['absences'] })
      if (msg.type === 'message') qc.invalidateQueries({ queryKey: ['messages'] })
    }

    ws.current.onclose = () => {
      retriesRef.current += 1
      const delay = Math.min(1000 * 2 ** retriesRef.current, 30000)
      reconnectTimeout.current = setTimeout(connectRef.current!, delay)
    }

    ws.current.onerror = () => ws.current?.close()
  }

  useEffect(() => {
    retriesRef.current = 0
    connectRef.current?.()
    return () => {
      clearTimeout(reconnectTimeout.current)
      ws.current?.close()
    }
  }, [userId])

  const disconnect = () => {
    clearTimeout(reconnectTimeout.current)
    ws.current?.close()
  }

  return { disconnect }
}
