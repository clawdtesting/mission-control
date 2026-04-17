import { TransitionError } from './errors'

export interface TransitionMachine<TState extends string> {
  canTransition: (from: TState, to: TState) => boolean
  applyTransition: (from: TState, to: TState, metadata?: Record<string, unknown>) => TState
}

export function runTransition<TState extends string>(
  machine: TransitionMachine<TState>,
  from: TState,
  to: TState,
  metadata?: Record<string, unknown>,
): TState {
  if (!machine.canTransition(from, to)) {
    throw new TransitionError(`Illegal transition: ${from} -> ${to}`)
  }

  return machine.applyTransition(from, to, metadata)
}
