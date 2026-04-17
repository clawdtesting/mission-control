export function buildArchiveQuery(jobType: string, tags: string[]): string {
  return `${jobType}:${tags.sort().join(',')}`
}
