import {access} from 'node:fs/promises'
import {join} from 'node:path'

export type LspServer = {
  command: string
  detected: boolean
  languages: string[]
  name: string
}

const SERVERS: Array<Omit<LspServer, 'detected'>> = [
  {command: 'typescript-language-server --stdio', languages: ['typescript', 'javascript'], name: 'typescript'},
  {command: 'pyright-langserver --stdio', languages: ['python'], name: 'pyright'},
  {command: 'rust-analyzer', languages: ['rust'], name: 'rust-analyzer'},
  {command: 'gopls', languages: ['go'], name: 'gopls'},
]

export async function detectLspServers(workspacePath: string): Promise<LspServer[]> {
  const files = await Promise.all([
    exists(join(workspacePath, 'package.json')),
    exists(join(workspacePath, 'tsconfig.json')),
    exists(join(workspacePath, 'pyproject.toml')),
    exists(join(workspacePath, 'requirements.txt')),
    exists(join(workspacePath, 'Cargo.toml')),
    exists(join(workspacePath, 'go.mod')),
  ])

  const [packageJson, tsconfig, pyproject, requirements, cargo, goMod] = files
  return SERVERS.map((server) => ({
    ...server,
    detected:
      (server.name === 'typescript' && (packageJson || tsconfig)) ||
      (server.name === 'pyright' && (pyproject || requirements)) ||
      (server.name === 'rust-analyzer' && cargo) ||
      (server.name === 'gopls' && goMod),
  }))
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
