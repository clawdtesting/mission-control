export interface FinalistCandidate {
  id: string
  score: number
}

export function rankFinalists(candidates: FinalistCandidate[]): FinalistCandidate[] {
  return [...candidates].sort((a, b) => b.score - a.score)
}
