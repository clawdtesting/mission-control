'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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

export default function HermesPage() {
  const router = useRouter()
  const [status, setStatus] = useState<HermesStatus | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [authChecked, setAuthChecked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auth check — redirect to /login if not authenticated
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace('/login?redirect=/hermes')
          return null
        }
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [router])

  // Fetch Hermes status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/hermes/status')
      if (res.ok) setStatus(await res.json())
    } catch {
      setStatus((prev) => (prev ? { ...prev, online: false } : null))
    }
  }, [])

  // Fetch conversation
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/hermes/chat?conversationId=hermes:default')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    if (!authChecked) return
    fetchStatus()
    fetchMessages()
    const statusTimer = setInterval(fetchStatus, 30_000)
    const msgTimer = setInterval(fetchMessages, 10_000)
    return () => {
      clearInterval(statusTimer)
      clearInterval(msgTimer)
    }
  }, [authChecked, fetchStatus, fetchMessages])

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      if (!res.ok) throw new Error(data.error || 'Failed to send')
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
  const notConfigured =
    status !== null && !status.online && (status.host === '127.0.0.1' || status.host === 'localhost')

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-card/50 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">Hermes</h1>
              {status?.model && (
                <span className="text-xs text-muted-foreground/60 font-mono">{status.model}</span>
              )}
            </div>
            {status && (
              <span className="text-[11px] text-muted-foreground/50 font-mono">
                {status.host}:{status.port}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status === null ? (
            <span className="text-xs text-muted-foreground/50">checking…</span>
          ) : online ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              online
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              offline
            </span>
          )}
          <a
            href="/overview"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Mission Control →
          </a>
        </div>
      </header>

      {/* Not configured banner */}
      {notConfigured && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-300 flex-shrink-0">
          <div className="font-semibold mb-1">Hermes is not configured yet</div>
          <div className="text-amber-300/80 leading-relaxed">
            Set these environment variables in your <b>Render dashboard</b>, then redeploy:
            <pre className="mt-2 text-[11px] font-mono bg-black/30 rounded p-2 overflow-x-auto">
{`HERMES_GATEWAY_HOST=<your-vps-ip>     # e.g. 1.2.3.4
HERMES_GATEWAY_PORT=8644              # port Hermes listens on
HERMES_API_KEY=<optional-bearer-key>`}
            </pre>
            Render → your service → Environment → Add env var → Save → auto-redeploy.
          </div>
        </div>
      )}

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-h-0 max-w-3xl w-full mx-auto">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <span className="text-5xl">💬</span>
              <p className="text-sm text-muted-foreground">
                {online ? 'Say hello to Hermes.' : 'No messages yet.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.from_agent !== 'hermes'
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-0.5 px-1">
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                      {isUser ? msg.from_agent : 'Hermes'}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
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

        {!autoScroll && messages.length > 0 && (
          <div className="flex justify-center py-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setAutoScroll(true)
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1 rounded-full bg-card border border-border/40"
            >
              ↓ scroll to latest
            </button>
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-border/40 px-4 py-3 bg-card/30 flex-shrink-0">
          {sendError && (
            <div className="mb-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
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
              placeholder={
                online
                  ? 'Message Hermes…  (Enter to send, Shift+Enter for newline)'
                  : 'Hermes is offline — configure HERMES_GATEWAY_HOST and redeploy'
              }
              disabled={!online || sending}
              rows={2}
              className="flex-1 resize-none bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              onClick={sendMessage}
              disabled={!online || sending || !draft.trim()}
              size="sm"
              className="h-[4.75rem] px-5"
            >
              {sending ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:75ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                </span>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
