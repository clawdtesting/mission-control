export function validatorScore(votes: Array<{ weight: number; score: number }>): number {
  const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0)
  if (totalWeight === 0) return 0
  return votes.reduce((sum, vote) => sum + vote.weight * vote.score, 0) / totalWeight
}
