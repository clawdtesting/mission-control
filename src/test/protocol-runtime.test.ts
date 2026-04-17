import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { runJob } from '../../app/runner'
import { ArtifactManager } from '../../runtime/artifacts/artifact-manager'
import { FileStateStore } from '../../runtime/state/store'
import { canTransition as canV1Transition } from '../../protocols/v1/state-machine'
import { guardCommitWindow } from '../../protocols/prime/guards'
import { buildUnsignedEnvelope } from '../../runtime/tx/unsigned-envelope'
import { runPreSignChecks } from '../../runtime/tx/pre-sign-checks'
import { validateUnsignedEnvelope } from '../../runtime/tx/tx-validator'

async function makeServices() {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'protocol-runtime-'))
  return {
    base,
    services: {
      artifacts: new ArtifactManager(path.join(base, 'artifacts')),
      stateStore: new FileStateStore(path.join(base, 'state')),
    },
  }
}

function futureIso(hours = 24): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

function pastIso(hours = 24): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

describe('protocol runtime refactor', () => {
  test('v1 pipeline progresses through deterministic states', async () => {
    const { services } = await makeServices()
    const finalState = await runJob(
      {
        id: 'v1-1',
        protocol: 'v1',
        objective: 'Ship deterministic report',
        family: 'standard',
        operatorApproved: true,
      },
      services,
    )

    expect(finalState).toBe('DONE')
    const persisted = await services.stateStore.load('v1-1')
    expect(persisted?.state).toBe('DONE')
  })

  test('prime deadline guard blocks expired commit window', () => {
    expect(
      guardCommitWindow(new Date(), {
        commitDeadline: pastIso(),
        revealDeadline: futureIso(),
        finalistAcceptDeadline: futureIso(),
        trialDeadline: futureIso(),
        scoreCommitDeadline: futureIso(),
        scoreRevealDeadline: futureIso(),
        fallbackPromotionDeadline: futureIso(),
      }),
    ).toBe(false)
  })

  test('illegal state transitions are rejected', () => {
    expect(canV1Transition('DISCOVERED', 'DONE')).toBe(false)
  })

  test('missing canonical artifact bundle blocks progression', async () => {
    const { services } = await makeServices()
    const finalState = await runJob(
      {
        id: 'v1-2',
        protocol: 'v1',
        objective: 'Run high assurance task',
        family: 'standard',
        omitFindings: true,
        operatorApproved: true,
      },
      services,
    )

    expect(finalState).toBe('BLOCKED_ARTIFACT_EMISSION_REQUIRED')
  })

  test('unsigned tx packaging remains valid', () => {
    const envelope = buildUnsignedEnvelope({
      chainId: 1,
      to: '0xabc',
      data: '0x1234',
      value: '0',
      metadata: {},
    })

    expect(validateUnsignedEnvelope(envelope).ok).toBe(true)
    expect(runPreSignChecks(envelope).ok).toBe(true)
  })

  test('runtime paths reject signing or broadcast metadata', () => {
    const envelope = buildUnsignedEnvelope({
      chainId: 1,
      to: '0xabc',
      data: '0x1234',
      value: '0',
      metadata: { privateKey: 'never', broadcast: true },
    })

    const checks = runPreSignChecks(envelope)
    expect(checks.ok).toBe(false)
    expect(checks.errors.join(' ')).toMatch(/Forbidden runtime signing field/)
  })
})
