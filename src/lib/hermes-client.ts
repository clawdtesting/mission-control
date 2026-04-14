/**
 * Hermes Agent REST API Client
 *
 * HTTP client for the Hermes gateway API server (default port 8644).
 * Used when the gateway is running to read/manage state via REST instead
 * of reading files directly.
 *
 * Hermes API endpoints (v0.4.0+):
 *   GET  /api/jobs         — list cron jobs
 *   POST /api/jobs         — create cron job
 *   PUT  /api/jobs/:id     — update cron job
 *   DELETE /api/jobs/:id   — delete cron job
 *   GET  /v1/models        — list available models
 *
 * Sessions (v0.7.0+):
 *   POST /v1/chat/completions          — OpenAI-compatible chat
 *   POST /v1/responses                 — OpenAI responses API
 *   Header: X-Hermes-Session-Id        — session continuity
 */

import { config } from './config'
import { logger } from './logger'

export interface HermesJobPayload {
  prompt: string
  schedule: string
  enabled?: boolean
}

export interface HermesJobResponse {
  id: string
  prompt: string
  schedule: string
  enabled: boolean
  last_run_at?: string | null
  created_at?: string | null
  run_count?: number
}

export interface HermesModelInfo {
  id: string
  object: string
  owned_by?: string
}

function getBaseUrl(): string {
  return `http://${config.hermesGatewayHost}:${config.hermesGatewayPort}`
}

async function hermesRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.hermesApiKey) {
    headers['Authorization'] = `Bearer ${config.hermesApiKey}`
  }
  Object.assign(headers, extraHeaders)
  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  const response = await fetch(url, init)

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Hermes API ${method} ${path} → ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Cron job management
// ---------------------------------------------------------------------------

export async function listHermesJobs(): Promise<HermesJobResponse[]> {
  try {
    const result = await hermesRequest<HermesJobResponse[] | { jobs: HermesJobResponse[] }>(
      'GET', '/api/jobs',
    )
    return Array.isArray(result) ? result : result.jobs ?? []
  } catch (err) {
    logger.warn({ err }, 'Failed to list Hermes jobs via API')
    return []
  }
}

export async function createHermesJob(payload: HermesJobPayload): Promise<HermesJobResponse> {
  return hermesRequest<HermesJobResponse>('POST', '/api/jobs', payload)
}

export async function updateHermesJob(
  id: string,
  payload: Partial<HermesJobPayload>,
): Promise<HermesJobResponse> {
  return hermesRequest<HermesJobResponse>('PUT', `/api/jobs/${encodeURIComponent(id)}`, payload)
}

export async function deleteHermesJob(id: string): Promise<void> {
  await hermesRequest<unknown>('DELETE', `/api/jobs/${encodeURIComponent(id)}`)
}

// ---------------------------------------------------------------------------
// Chat completions (OpenAI-compatible)
// ---------------------------------------------------------------------------

export interface HermesChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface HermesChatResult {
  reply: string
  sessionId?: string
}

export async function chatWithHermes(
  messages: HermesChatMessage[],
  sessionId?: string,
): Promise<HermesChatResult> {
  const url = `${getBaseUrl()}/v1/chat/completions`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.hermesApiKey) {
    headers['Authorization'] = `Bearer ${config.hermesApiKey}`
  }
  if (sessionId) {
    headers['X-Hermes-Session-Id'] = sessionId
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: 'default', messages, stream: false }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Hermes chat → ${response.status}: ${text}`)
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const reply = data.choices?.[0]?.message?.content ?? ''
  const newSessionId = response.headers.get('x-hermes-session-id') ?? sessionId

  return { reply, sessionId: newSessionId ?? undefined }
}

// ---------------------------------------------------------------------------
// Model information
// ---------------------------------------------------------------------------

export async function listHermesModels(): Promise<HermesModelInfo[]> {
  try {
    const result = await hermesRequest<{ data: HermesModelInfo[] } | HermesModelInfo[]>(
      'GET', '/v1/models',
    )
    return Array.isArray(result) ? result : result.data ?? []
  } catch (err) {
    logger.warn({ err }, 'Failed to list Hermes models via API')
    return []
  }
}
