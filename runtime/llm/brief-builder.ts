import { briefTemplates } from './templates'

export function buildBrief(protocol: 'v1' | 'prime', objective: string): string {
  const template = protocol === 'prime' ? briefTemplates.prime : briefTemplates.default
  return `${template}\nObjective: ${objective}`
}
