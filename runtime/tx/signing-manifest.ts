import type { UnsignedEnvelope } from './unsigned-envelope'
import type { SimulationResult } from './simulation'

export interface SigningManifest {
  envelope: UnsignedEnvelope
  simulation: SimulationResult
  operatorChecklist: string[]
}

export function buildSigningManifest(envelope: UnsignedEnvelope, simulation: SimulationResult): SigningManifest {
  return {
    envelope,
    simulation,
    operatorChecklist: [
      'Confirm tx target contract and chainId',
      'Review artifact bundle completeness',
      'Sign outside runtime with operator key custody',
    ],
  }
}
