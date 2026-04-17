import { runPipeline } from '../../runtime/engine/pipeline-runner'
import type { RuntimeServices } from '../../runtime/engine/stage-context'
import { runTransition } from '../../runtime/engine/transition-runner'
import { applyTransition, canTransition } from './state-machine'
import type { PrimeJob, PrimeState } from './types'
import { acceptFinalistStage } from './stages/accept-finalist'
import { commitApplicationStage } from './stages/commit-application'
import { discoverStage } from './stages/discover'
import { executeTrialStage } from './stages/execute-trial'
import { finalizeShortlistStage } from './stages/finalize-shortlist'
import { finalizeWinnerStage } from './stages/finalize-winner'
import { promoteFallbackStage } from './stages/promote-fallback'
import { revealApplicationStage } from './stages/reveal-application'
import { revealValidatorScoreStage } from './stages/reveal-validator-score'
import { settleStage } from './stages/settle'
import { submitTrialStage } from './stages/submit-trial'

const terminal: PrimeState[] = ['DONE', 'FAILED']

export async function runPrimePipeline(job: PrimeJob, services: RuntimeServices): Promise<PrimeState> {
  return runPipeline<PrimeState, PrimeJob>({
    initialState: 'DISCOVERED',
    job,
    jobId: job.id,
    terminalStates: terminal,
    executeStage: async ({ state, jobId, now }) => {
      const ctx = { job, jobId, now: now ?? new Date(), currentState: state, services }
      let next: PrimeState = state

      switch (state) {
        case 'DISCOVERED':
          next = await discoverStage(ctx)
          break
        case 'EVALUATED':
          next = 'COMMIT_READY'
          break
        case 'COMMIT_READY':
          next = await commitApplicationStage(ctx)
          break
        case 'COMMITTED_UNSIGNED':
          next = 'COMMIT_CONFIRMED'
          break
        case 'COMMIT_CONFIRMED':
          next = 'REVEAL_READY'
          break
        case 'REVEAL_READY':
          next = await revealApplicationStage(ctx)
          break
        case 'REVEALED_UNSIGNED':
          next = 'REVEAL_CONFIRMED'
          break
        case 'REVEAL_CONFIRMED':
          next = 'SHORTLIST_PENDING'
          break
        case 'SHORTLIST_PENDING':
          next = await finalizeShortlistStage(ctx)
          break
        case 'FINALIST':
          next = 'FINALIST_ACCEPT_READY'
          break
        case 'FINALIST_ACCEPT_READY':
          next = await acceptFinalistStage(ctx)
          break
        case 'FINALIST_ACCEPTED_UNSIGNED':
          next = 'FINALIST_ACCEPT_CONFIRMED'
          break
        case 'FINALIST_ACCEPT_CONFIRMED':
          next = 'TRIAL_EXECUTION_READY'
          break
        case 'TRIAL_EXECUTION_READY':
          next = await executeTrialStage(ctx)
          break
        case 'TRIAL_EXECUTED':
          next = await submitTrialStage(ctx)
          break
        case 'TRIAL_PUBLISHED':
          next = 'VALIDATOR_SCORING_PENDING'
          break
        case 'VALIDATOR_SCORING_PENDING':
          next = await revealValidatorScoreStage(ctx)
          break
        case 'WINNER_PENDING':
          next = await finalizeWinnerStage(ctx)
          break
        case 'FALLBACK_PROMOTABLE':
          next = await promoteFallbackStage(ctx)
          break
        case 'WINNER_DESIGNATED':
          next = await settleStage(ctx)
          break
        default:
          next = 'FAILED'
      }

      const transitioned = runTransition({ canTransition, applyTransition }, state, next)
      await services.stateStore.save<PrimeState>(jobId, { state: transitioned, updatedAt: new Date().toISOString() })
      return transitioned
    },
  })
}
