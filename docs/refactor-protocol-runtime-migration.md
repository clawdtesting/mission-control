# Protocol Runtime Refactor Migration Summary

## Scope note
This repository did not contain the exact `agent/*`, `core/*`, and protocol files enumerated in the request. The refactor establishes the requested protocol/runtime architecture as a new primary execution substrate and adds compatibility shims for loop/pipeline entrypoints.

## New architecture added
- `runtime/*` as shared infrastructure.
- `protocols/v1/*` as linear AGIJobManager v1 pipeline.
- `protocols/prime/*` as explicit Prime procurement state machine.
- `app/*` as entrypoints that route via protocol router and pipeline runner.

## Mapping table (requested conceptual mapping)

| Requested old area | New location |
| --- | --- |
| `agent/artifact-manager.js` | `runtime/artifacts/artifact-manager.ts` |
| `agent/build-brief.js`, `agent/templates.js` | `runtime/llm/brief-builder.ts`, `runtime/llm/templates.ts` |
| `agent/ipfs-verify.js` | `runtime/publish/ipfs-verify.ts` |
| `agent/mcp.js`, `agent/rpc.js` | `runtime/chain/mcp.ts`, `runtime/chain/rpc.ts` |
| `agent/lock.js`, `agent/state.js`, `agent/recovery.js`, `agent/state-retention.js` | `runtime/state/*` |
| `agent/pre-sign-checks.js`, `agent/signing-manifest.js`, `agent/simulation.js`, `agent/tx-validator.js` | `runtime/tx/*` |
| v1 lifecycle files in `agent/*` | `protocols/v1/stages/*` and `protocols/v1/tx/*` |
| Prime orchestration files in `agent/prime-*` | `protocols/prime/*` |
| overlapping `loops/` + `pipelines/` | thin wrappers to `app/runner.ts` / `app/daemon.ts` |

## Deleted / merged
- No existing runtime/protocol files were deleted because the expected old paths were not present in this repository snapshot.
- New modules were merged around a single dominant abstraction: protocol router -> pipeline runner -> state machine transitions -> stage executors.

## Legacy shims retained
- `loops/index.ts` and `pipelines/index.ts` are temporary compatibility shims with TODO markers.

## Intentional compromises
- Chain and MCP modules are read-only stubs to preserve the non-negotiable “no signing/broadcast in runtime” doctrine.
- IPFS publish is deterministic local CID simulation in this baseline; network publishing is intentionally not implemented in runtime.
