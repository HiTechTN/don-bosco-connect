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
  const userIdRef = useRef(userId)

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    retriesRef.current = 0
    const connect = () => {
      const uid = userIdRef.current
      if (!uid) return

      const wsUrl = `${import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'}/v1/notifications`

      // Verify cookie-based auth is valid before connecting WS
      fetch('/api/v1/auth/me', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Not authenticated')
          return res.json()
        })
        .then(() => {
          // Auth valid — connect WebSocket with userId
          const socket = new WebSocket(`${wsUrl}?user_id=${uid}`)
          ws.current = socket

          socket.onmessage = (event) => {
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

          socket.onclose = () => {
            retriesRef.current += 1
            const delay = Math.min(1000 * 2 ** retriesRef.current, 30000)
            reconnectTimeout.current = setTimeout(connect, delay)
          }

          socket.onerror = () => socket.close()
        })
        .catch(() => {
          // Not authenticated — don't connect WS
        })
    }

    connect()

    return () => {
      clearTimeout(reconnectTimeout.current)
      ws.current?.close()
    }
  }, [userId, qc])

  const disconnect = () => {
    clearTimeout(reconnectTimeout.current)
    ws.current?.close()
  }

  return { disconnect }
}
