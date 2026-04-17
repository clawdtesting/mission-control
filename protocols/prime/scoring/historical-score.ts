export function historicalScore(samples: number[]): number {
  if (samples.length === 0) return 0
  return samples.reduce((sum, s) => sum + s, 0) / samples.length
}
