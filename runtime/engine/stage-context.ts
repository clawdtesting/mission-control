import type { ArtifactManager } from '../artifacts/artifact-manager'
import type { StateStore } from '../state/store'

export interface RuntimeServices {
  artifacts: ArtifactManager
  stateStore: StateStore
}

export interface StageContext<TState extends string, TJob extends object> {
  jobId: string
  job: TJob
  now: Date
  currentState: TState
  services: RuntimeServices
}
