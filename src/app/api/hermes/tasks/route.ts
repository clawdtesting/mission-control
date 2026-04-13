import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getHermesTasks } from '@/lib/hermes-tasks'
import { isHermesGatewayRunning } from '@/lib/hermes-sessions'
import { listHermesJobs, createHermesJob, deleteHermesJob } from '@/lib/hermes-client'

/**
 * GET /api/hermes/tasks — Returns Hermes cron jobs.
 * When the gateway is running, fetches live from the Hermes REST API.
 * Falls back to file-based scanning when the gateway is offline.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const force = request.nextUrl.searchParams.get('force') === 'true'

  if (isHermesGatewayRunning()) {
    const jobs = await listHermesJobs()
    if (jobs.length > 0 || force) {
      return NextResponse.json({ cronJobs: jobs.map(j => ({
        id: j.id,
        prompt: j.prompt,
        schedule: j.schedule,
        enabled: j.enabled,
        lastRunAt: j.last_run_at ?? null,
        lastOutput: null,
        createdAt: j.created_at ?? null,
        runCount: j.run_count ?? 0,
      })) })
    }
  }

  const result = getHermesTasks(force)
  return NextResponse.json(result)
}

/**
 * POST /api/hermes/tasks — Create a new Hermes cron job via the gateway API.
 * Body: { prompt: string, schedule: string, enabled?: boolean }
 */
export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  if (!isHermesGatewayRunning()) {
    return NextResponse.json({ error: 'Hermes gateway is not running' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { prompt, schedule, enabled } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }
    if (!schedule || typeof schedule !== 'string') {
      return NextResponse.json({ error: 'schedule is required' }, { status: 400 })
    }

    const job = await createHermesJob({ prompt, schedule, enabled: enabled !== false })
    return NextResponse.json({ job }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create job' }, { status: 500 })
  }
}

/**
 * DELETE /api/hermes/tasks?id=<jobId> — Delete a Hermes cron job via the gateway API.
 */
export async function DELETE(request: NextRequest) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  if (!isHermesGatewayRunning()) {
    return NextResponse.json({ error: 'Hermes gateway is not running' }, { status: 503 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
  }

  try {
    await deleteHermesJob(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete job' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
