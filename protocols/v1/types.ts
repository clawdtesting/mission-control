import type { UnsignedEnvelope } from '../../runtime/tx/unsigned-envelope'

export type V1State =
  | 'DISCOVERED'
  | 'EVALUATED'
  | 'APPLY_READY'
  | 'APPLIED_UNSIGNED'
  | 'APPLIED_CONFIRMED'
  | 'EXECUTION_READY'
  | 'EXECUTED'
  | 'VALIDATED'
  | 'PUBLISHED'
  | 'SUBMISSION_READY'
  | 'SUBMITTED_UNSIGNED'
  | 'RECONCILING'
  | 'DONE'
  | 'FAILED'
  | 'BLOCKED_RETRIEVAL_REQUIRED'
  | 'BLOCKED_OPERATOR_REVIEW'
  | 'BLOCKED_ARTIFACT_EMISSION_REQUIRED'

export interface V1Job {
  id: string
  objective: string
  family?: string
  protocol?: 'v1'
  omitRetrievalPacket?: boolean
  omitFindings?: boolean
  applyEnvelope?: UnsignedEnvelope
  submitEnvelope?: UnsignedEnvelope
  operatorApproved?: boolean
}
