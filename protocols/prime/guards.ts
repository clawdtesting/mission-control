import type { PrimeDeadlines } from './types'

function before(now: Date, iso: string): boolean {
  return now.getTime() <= new Date(iso).getTime()
}

export function guardCommitWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.commitDeadline)
}
export function guardRevealWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.revealDeadline)
}
export function guardFinalistAcceptWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.finalistAcceptDeadline)
}
export function guardTrialWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.trialDeadline)
}
export function guardScoreCommitWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.scoreCommitDeadline)
}
export function guardScoreRevealWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.scoreRevealDeadline)
}
export function guardFallbackPromotionWindow(now: Date, deadlines: PrimeDeadlines): boolean {
  return before(now, deadlines.fallbackPromotionDeadline)
}
