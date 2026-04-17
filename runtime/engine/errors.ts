export class TransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TransitionError'
  }
}

export class GuardBlockedError extends Error {
  constructor(
    public readonly blockedState: string,
    public readonly reasons: string[],
  ) {
    super(`Guard blocked progression to ${blockedState}: ${reasons.join(', ')}`)
    this.name = 'GuardBlockedError'
  }
}
