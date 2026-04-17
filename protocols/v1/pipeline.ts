import { runPipeline } from '../../runtime/engine/pipeline-runner'
import { runTransition } from '../../runtime/engine/transition-runner'
import type { RuntimeServices } from '../../runtime/engine/stage-context'
import { applyTransition, canTransition } from './state-machine'
import type { V1Job, V1State } from './types'
import { applyStage } from './stages/apply'
import { confirmStage } from './stages/confirm'
import { discoverStage } from './stages/discover'
import { evaluateStage } from './stages/evaluate'
import { executeStage } from './stages/execute'
import { publishStage } from './stages/publish'
import { reconcileStage } from './stages/reconcile'
import { submitStage } from './stages/submit'
import { validateStage } from './stages/validate'

const terminal: V1State[] = ['DONE', 'FAILED']

export async function runV1Pipeline(job: V1Job, services: RuntimeServices): Promise<V1State> {
  return runPipeline<V1State, V1Job>({
    initialState: 'DISCOVERED',
    job,
    jobId: job.id,
    terminalStates: terminal,
    executeStage: async ({ state, jobId, now }) => {
      const ctx = { job, jobId, now: now ?? new Date(), currentState: state, services }
      let next: V1State = state

      switch (state) {
        case 'DISCOVERED':
          next = await discoverStage(ctx)
          break
        case 'EVALUATED':
          next = await evaluateStage(ctx)
          break
        case 'APPLY_READY':
          next = await applyStage(ctx)
          break
        case 'APPLIED_UNSIGNED':
          next = await confirmStage(ctx)
          break
        case 'APPLIED_CONFIRMED':
          next = 'EXECUTION_READY'
          break
        case 'EXECUTION_READY':
          next = await executeStage(ctx)
          break
        case 'EXECUTED':
          next = await validateStage(ctx)
          break
        case 'VALIDATED':
          next = await publishStage(ctx)
          break
        case 'PUBLISHED':
          next = 'SUBMISSION_READY'
          break
        case 'SUBMISSION_READY':
          next = await submitStage(ctx)
          break
        case 'SUBMITTED_UNSIGNED':
          next = 'RECONCILING'
          break
        case 'RECONCILING':
          next = await reconcileStage(ctx)
          break
        default:
          next = 'FAILED'
      }

      const transitioned = runTransition({ canTransition, applyTransition }, state, next, { stageAt: now?.toISOString() })
      await services.stateStore.save<V1State>(jobId, { state: transitioned, updatedAt: new Date().toISOString() })
      return transitioned
    },
  })
}
