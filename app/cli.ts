#!/usr/bin/env node
import path from 'node:path'
import { ArtifactManager } from '../runtime/artifacts/artifact-manager'
import { FileStateStore } from '../runtime/state/store'
import { runJob } from './runner'

async function main() {
  const raw = process.argv[2]
  if (!raw) {
    throw new Error('Usage: node app/cli.ts "{...jobJson}"')
  }

  const job = JSON.parse(raw) as Record<string, unknown>
  const base = path.join(process.cwd(), 'archive/runtime')
  const services = {
    artifacts: new ArtifactManager(path.join(base, 'artifacts')),
    stateStore: new FileStateStore(path.join(base, 'state')),
  }

  const finalState = await runJob(job, services)
  process.stdout.write(`${JSON.stringify({ id: job.id, finalState })}\n`)
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`)
  process.exit(1)
})
