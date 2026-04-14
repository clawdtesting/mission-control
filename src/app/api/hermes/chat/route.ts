import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { chatWithHermes, type HermesChatMessage } from '@/lib/hermes-client'
import { logger } from '@/lib/logger'

const CONVERSATION_ID = 'hermes:default'
const HISTORY_LIMIT = 20

/**
 * GET /api/hermes/chat?conversationId=hermes:default
 * Returns stored messages for the Hermes conversation.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const workspaceId = auth.user.workspace_id ?? 1
  const conversationId = request.nextUrl.searchParams.get('conversationId') || CONVERSATION_ID

  try {
    const db = getDatabase()
    const messages = db
      .prepare(
        `SELECT id, conversation_id, from_agent, to_agent, content, message_type, metadata, created_at
         FROM messages
         WHERE conversation_id = ? AND workspace_id = ?
         ORDER BY created_at ASC`,
      )
      .all(conversationId, workspaceId)

    return NextResponse.json({ messages, conversationId })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch Hermes conversation')
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

/**
 * POST /api/hermes/chat
 * Body: { message: string, conversationId?: string, sessionId?: string }
 *
 * 1. Stores the user message in the DB
 * 2. Builds conversation history for context
 * 3. Calls Hermes /v1/chat/completions
 * 4. Stores the assistant reply in the DB
 * 5. Returns { reply, sessionId, userMsgId, assistantMsgId }
 */
export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const workspaceId = auth.user.workspace_id ?? 1
  const sender = auth.user.username || auth.user.display_name || 'operator'

  let body: { message?: string; conversationId?: string; sessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const userMessage = (body.message ?? '').trim()
  if (!userMessage) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const conversationId = body.conversationId || CONVERSATION_ID
  const sessionId = body.sessionId

  const db = getDatabase()

  // Fetch recent history for context window
  const history = db
    .prepare(
      `SELECT from_agent, content FROM messages
       WHERE conversation_id = ? AND workspace_id = ?
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(conversationId, workspaceId, HISTORY_LIMIT) as Array<{ from_agent: string; content: string }>

  // Build messages array for Hermes (oldest first)
  const contextMessages: HermesChatMessage[] = history
    .reverse()
    .map((m) => ({
      role: m.from_agent === 'hermes' ? 'assistant' : 'user',
      content: m.content,
    }))
  contextMessages.push({ role: 'user', content: userMessage })

  // Persist user message
  const now = Math.floor(Date.now() / 1000)
  const userInsert = db
    .prepare(
      `INSERT INTO messages (conversation_id, from_agent, to_agent, content, message_type, metadata, workspace_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(conversationId, sender, 'hermes', userMessage, 'text', null, workspaceId, now)
  const userMsgId = userInsert.lastInsertRowid

  // Call Hermes
  let reply = ''
  let newSessionId: string | undefined
  try {
    const result = await chatWithHermes(contextMessages, sessionId)
    reply = result.reply
    newSessionId = result.sessionId
  } catch (err) {
    logger.error({ err }, 'Hermes chat completion failed')
    return NextResponse.json({ error: 'Hermes did not respond. Check that HERMES_GATEWAY_HOST and HERMES_GATEWAY_PORT are set correctly.' }, { status: 502 })
  }

  // Persist assistant reply
  const replyNow = Math.floor(Date.now() / 1000)
  const assistantInsert = db
    .prepare(
      `INSERT INTO messages (conversation_id, from_agent, to_agent, content, message_type, metadata, workspace_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      conversationId,
      'hermes',
      sender,
      reply,
      'text',
      newSessionId ? JSON.stringify({ sessionId: newSessionId }) : null,
      workspaceId,
      replyNow,
    )
  const assistantMsgId = assistantInsert.lastInsertRowid

  return NextResponse.json({
    reply,
    sessionId: newSessionId,
    conversationId,
    userMsgId,
    assistantMsgId,
  })
}
