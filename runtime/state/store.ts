import fs from 'node:fs/promises'
import path from 'node:path'

export interface StateRecord<TState extends string> {
  state: TState
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface StateStore {
  load<TState extends string>(jobId: string): Promise<StateRecord<TState> | null>
  save<TState extends string>(jobId: string, next: StateRecord<TState>): Promise<void>
}

export class FileStateStore implements StateStore {
  constructor(private readonly baseDir: string) {}

  private recordPath(jobId: string): string {
    return path.join(this.baseDir, `${jobId}.state.json`)
  }

  async load<TState extends string>(jobId: string): Promise<StateRecord<TState> | null> {
    const file = this.recordPath(jobId)
    try {
      const raw = await fs.readFile(file, 'utf-8')
      return JSON.parse(raw) as StateRecord<TState>
    } catch {
      return null
    }
  }

  async save<TState extends string>(jobId: string, next: StateRecord<TState>): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true })
    await fs.writeFile(this.recordPath(jobId), `${JSON.stringify(next, null, 2)}\n`, 'utf-8')
  }
}
