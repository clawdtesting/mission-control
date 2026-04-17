import type { UnsignedEnvelope } from './unsigned-envelope'

export interface SimulationResult {
  ok: boolean
  gasEstimate: number
  notes: string[]
}

export function simulateUnsignedTx(_envelope: UnsignedEnvelope): SimulationResult {
  return { ok: true, gasEstimate: 21000, notes: ['simulation-only: no broadcast performed'] }
}
