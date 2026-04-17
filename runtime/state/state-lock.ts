const activeLocks = new Set<string>()

export async function withStateLock<T>(jobId: string, task: () => Promise<T>): Promise<T> {
  if (activeLocks.has(jobId)) {
    throw new Error(`State lock already held for ${jobId}`)
  }

  activeLocks.add(jobId)
  try {
    return await task()
  } finally {
    activeLocks.delete(jobId)
  }
}
