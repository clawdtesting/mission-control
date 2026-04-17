import type { StateStore } from './store'

export async function recoverState<TState extends string>(
  store: StateStore,
  jobId: string,
  fallbackState: TState,
): Promise<TState> {
  const record = await store.load<TState>(jobId)
  return record?.state ?? fallbackState
}
