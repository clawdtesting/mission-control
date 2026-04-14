'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useSmartPoll } from '@/lib/use-smart-poll'

interface HermesStatus {
  online: boolean
  model: string | null
  host: string
  port: number
}

interface ChatMessage {
  id: number
  from_agent: string
  to_agent: string
  content: string
  created_at: number
}

function formatTime(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HermesChatPanel() {
  const [status, setStatus] = useState<HermesStatus | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Fetch Hermes status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/hermes/status')
      if (res.ok) setStatus(await res.json())
    } catch {
      setStatus(prev => prev ? { ...prev, online: false } : null)
    }
  }, [])

  useSmartPoll(fetchStatus, 30_000)

  // Fetch conversation history
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/hermes/chat?conversationId=hermes:default')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } catch {
      // silent
    }
  }, [])

  useSmartPoll(fetchMessages, 10_000)

  // Auto-scroll when messages change
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, autoScroll])

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setAutoScroll(atBottom)
  }

  async function sendMessage() {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId: 'hermes:default', sessionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send')
      }
      if (data.sessionId) setSessionId(data.sessionId)
      setDraft('')
      await fetchMessages()
      setAutoScroll(true)
    } catch (err) {
      setSendError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const online = status?.online ?? false

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg">🤖</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Hermes</span>
              {status?.model && (
                <span className="text-[11px] text-muted-foreground/60 font-mono">{status.model}</span>
              )}
            </div>
            {status && (
              <span className="text-[10px] text-muted-foreground/50">
                {status.host}:{status.port}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === null ? (
            <span className="text-[11px] text-muted-foreground/50">checking...</span>
          ) : online ? (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              online
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              offline
            </span>
          )}
        </div>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-16">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-muted-foreground">No messages yet. Say hello to Hermes.</p>
            {!online && status !== null && (
              <p className="text-xs text-red-400 mt-1">
                Hermes appears offline — check that it is reachable at {status.host}:{status.port}
              </p>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.from_agent !== 'hermes'
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] text-muted-foreground/50">
                    {isUser ? msg.from_agent : 'Hermes'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/30">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-primary/15 text-foreground rounded-tr-sm'
                      : 'bg-surface-1 border border-border/40 text-foreground/90 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom nudge */}
      {!autoScroll && messages.length > 0 && (
        <div className="flex justify-center py-1 border-t border-border/20 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setAutoScroll(true)
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1"
          >
            scroll to latest
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border/40 p-3 bg-surface-1/60 flex-shrink-0">
        {sendError && (
          <div className="mb-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
            {sendError}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder={online ? 'Message Hermes… (Enter to send, Shift+Enter for newline)' : 'Hermes is offline'}
            disabled={!online || sending}
            rows={2}
            className="flex-1 resize-none bg-card border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={sendMessage}
            disabled={!online || sending || !draft.trim()}
            size="sm"
            className="h-[4.5rem] px-4"
          >
            {sending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse delay-150" />
              </span>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
