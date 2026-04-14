import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { listHermesModels } from '@/lib/hermes-client'
import { config } from '@/lib/config'
import { logger } from '@/lib/logger'

/**
 * GET /api/hermes/status
 * Quick reachability check for the remote Hermes gateway.
 * Returns { online, model, host, port } — never throws.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const host = config.hermesGatewayHost
  const port = config.hermesGatewayPort

  try {
    const models = await listHermesModels()
    const model = models[0]?.id ?? null
    return NextResponse.json({ online: true, model, host, port })
  } catch (err) {
    logger.debug({ err }, 'Hermes status check: offline')
    return NextResponse.json({ online: false, model: null, host, port })
  }
}
