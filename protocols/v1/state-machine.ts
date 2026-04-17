import type { V1State } from './types'
import { v1Transitions } from './transitions'

export function canTransition(from: V1State, to: V1State): boolean {
  return v1Transitions[from].includes(to)
}

export function applyTransition(from: V1State, to: V1State, _metadata?: Record<string, unknown>): V1State {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal V1 transition ${from} -> ${to}`)
  }

  return to
}
