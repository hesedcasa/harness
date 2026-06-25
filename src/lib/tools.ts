import {readdir, readFile, stat} from 'node:fs/promises'
import {join, relative, resolve} from 'node:path'

export type ToolName = 'grep' | 'ls' | 'read'

export const TOOL_NAMES: ToolName[] = ['ls', 'read', 'grep']

export async function callTool(workspacePath: string, tool: ToolName, input: string): Promise<string> {
  switch (tool) {
    case 'grep': {
      return grep(workspacePath, input)
    }

    case 'ls': {
      return list(workspacePath, input || '.')
    }

    case 'read': {
      return read(workspacePath, input)
    }
  }
}

export function assertToolName(value: string): ToolName {
  if (TOOL_NAMES.includes(value as ToolName)) {
    return value as ToolName
  }

  throw new Error(`Unknown tool "${value}". Available tools: ${TOOL_NAMES.join(', ')}`)
}

function resolveInside(root: string, input: string): string {
  const resolved = resolve(root, input || '.')
  const relativePath = relative(root, resolved)
  if (relativePath.startsWith('..')) {
    throw new Error('Tool input resolves outside the workspace.')
  }

  return resolved
}

async function list(root: string, input: string): Promise<string> {
  const path = resolveInside(root, input)
  const entries = await readdir(path, {withFileTypes: true})
  return entries
    .map((entry) => `${entry.isDirectory() ? 'dir ' : 'file'} ${entry.name}`)
    .sort()
    .join('\n')
}

async function read(root: string, input: string): Promise<string> {
  if (!input) {
    throw new Error('read requires a file path input.')
  }

  const path = resolveInside(root, input)
  const details = await stat(path)
  if (!details.isFile()) {
    throw new Error('read input must be a file.')
  }

  return readFile(path, 'utf8')
}

async function grep(root: string, input: string): Promise<string> {
  if (!input) {
    throw new Error('grep requires a search string input.')
  }

  const matches: string[] = []
  await walk(root, async (path) => {
    const content = await readFile(path, 'utf8').catch(() => '')
    const lines = content.split('\n')
    for (const [index, line] of lines.entries()) {
      if (line.includes(input)) {
        matches.push(`${relative(root, path)}:${index + 1}: ${line}`)
      }
    }
  })

  return matches.join('\n')
}

async function walk(path: string, visit: (path: string) => Promise<void>): Promise<void> {
  const entries = await readdir(path, {withFileTypes: true})
  await Promise.all(
    entries.map(async (entry) => {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        return
      }

      const child = join(path, entry.name)
      if (entry.isDirectory()) {
        await walk(child, visit)
      } else if (entry.isFile()) {
        await visit(child)
      }
    }),
  )
}
