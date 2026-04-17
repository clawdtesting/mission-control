export const CANONICAL_ARTIFACTS = [
  'job_spec.json',
  'retrieval_packet.json',
  'decomposition_plan.json',
  'execution_trace.jsonl',
  'findings.json',
  'validator_packet.json',
  'completion_manifest.json',
  'repro_envelope.json',
  'archive_index_record.json',
  'metrics_record.json',
] as const

export type CanonicalArtifactName = (typeof CANONICAL_ARTIFACTS)[number]
