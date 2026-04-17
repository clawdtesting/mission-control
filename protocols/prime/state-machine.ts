import type { PrimeState } from './types'
import { primeTransitions } from './transitions'

export function canTransition(from: PrimeState, to: PrimeState): boolean {
  return primeTransitions[from].includes(to)
}

export function applyTransition(from: PrimeState, to: PrimeState, _metadata?: Record<string, unknown>): PrimeState {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal Prime transition ${from} -> ${to}`)
  }

  return to
}
