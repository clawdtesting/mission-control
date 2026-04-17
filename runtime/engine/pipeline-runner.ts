export type StageExecutor<TState extends string, TJob extends object> = (args: {
  state: TState
  job: TJob
  jobId: string
  now?: Date
}) => Promise<TState>

export async function runPipeline<TState extends string, TJob extends object>(args: {
  initialState: TState
  job: TJob
  jobId: string
  terminalStates: TState[]
  executeStage: StageExecutor<TState, TJob>
  maxSteps?: number
}): Promise<TState> {
  const maxSteps = args.maxSteps ?? 50
  let current = args.initialState

  for (let i = 0; i < maxSteps; i += 1) {
    if (args.terminalStates.includes(current) || String(current).startsWith('BLOCKED_')) {
      return current
    }

    current = await args.executeStage({
      state: current,
      job: args.job,
      jobId: args.jobId,
      now: new Date(),
    })
  }

  throw new Error(`Pipeline exceeded max steps (${maxSteps}) without reaching terminal state`)
}
