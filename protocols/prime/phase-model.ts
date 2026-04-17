import type { PrimeState } from './types'

export type PrimePhase =
  | 'COMMIT'
  | 'REVEAL'
  | 'SHORTLIST'
  | 'FINALIST_ACCEPT'
  | 'TRIAL'
  | 'VALIDATOR_SCORING'
  | 'WINNER_OR_FALLBACK'
  | 'COMPLETE'

export function phaseForState(state: PrimeState): PrimePhase {
  if (['COMMIT_READY', 'COMMITTED_UNSIGNED', 'COMMIT_CONFIRMED'].includes(state)) return 'COMMIT'
  if (['REVEAL_READY', 'REVEALED_UNSIGNED', 'REVEAL_CONFIRMED'].includes(state)) return 'REVEAL'
  if (['SHORTLIST_PENDING', 'FINALIST'].includes(state)) return 'SHORTLIST'
  if (['FINALIST_ACCEPT_READY', 'FINALIST_ACCEPTED_UNSIGNED', 'FINALIST_ACCEPT_CONFIRMED'].includes(state)) return 'FINALIST_ACCEPT'
  if (['TRIAL_EXECUTION_READY', 'TRIAL_EXECUTED', 'TRIAL_PUBLISHED'].includes(state)) return 'TRIAL'
  if (state === 'VALIDATOR_SCORING_PENDING') return 'VALIDATOR_SCORING'
  if (['WINNER_PENDING', 'WINNER_DESIGNATED', 'FALLBACK_PROMOTABLE'].includes(state)) return 'WINNER_OR_FALLBACK'
  return 'COMPLETE'
}
