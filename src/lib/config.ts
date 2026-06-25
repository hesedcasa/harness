import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {homedir} from 'node:os'
import {dirname, join, resolve} from 'node:path'

export type ProviderApi =
  | 'anthropic-messages'
  | 'azure-openai-responses'
  | 'google-generative-ai'
  | 'google-vertex'
  | 'mistral'
  | 'openai-codex-responses'
  | 'openai-completions'
  | 'openai-responses'

export type WorkspaceMode = 'local' | 'sandbox'

export type ProviderProfile = {
  api: ProviderApi
  apiKeyEnv?: string
  baseUrl?: string
  model: string
  provider: string
}

export type WorkspaceConfig = {
  gitBranch?: string
  gitRepo?: string
  mode: WorkspaceMode
  path: string
}

export type SkillConfig = {
  description?: string
  path: string
}

export type HarnessConfig = {
  activeProfile?: string
  activeWorkspace?: string
  profiles: Record<string, ProviderProfile>
  skills: Record<string, SkillConfig>
  workspaces: Record<string, WorkspaceConfig>
}

export const DEFAULT_CONFIG: HarnessConfig = {
  profiles: {},
  skills: {},
  workspaces: {},
}

export function getHarnessHome(): string {
  return process.env.HARNESS_HOME ? resolve(process.env.HARNESS_HOME) : join(homedir(), '.ai-harness')
}

export function getConfigPath(): string {
  return join(getHarnessHome(), 'config.json')
}

export function getSandboxRoot(): string {
  return join(getHarnessHome(), 'sandboxes')
}

export async function loadConfig(): Promise<HarnessConfig> {
  try {
    const raw = await readFile(getConfigPath(), 'utf8')
    return normalizeConfig(JSON.parse(raw) as Partial<HarnessConfig>)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {...DEFAULT_CONFIG, profiles: {}, skills: {}, workspaces: {}}
    }

    throw error
  }
}

export async function saveConfig(config: HarnessConfig): Promise<void> {
  const path = getConfigPath()
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, `${JSON.stringify(normalizeConfig(config), null, 2)}\n`, 'utf8')
}

export async function updateConfig(mutator: (config: HarnessConfig) => Promise<void> | void): Promise<HarnessConfig> {
  const config = await loadConfig()
  await mutator(config)
  await saveConfig(config)
  return config
}

export function resolveProfile(config: HarnessConfig, requested?: string): [string, ProviderProfile] {
  const name = requested ?? config.activeProfile
  if (!name) {
    throw new Error('No profile selected. Pass --profile or run `ai profile use <name>`.')
  }

  const profile = config.profiles[name]
  if (!profile) {
    throw new Error(`Profile "${name}" does not exist.`)
  }

  return [name, profile]
}

export function resolveWorkspace(config: HarnessConfig, requested?: string): [string, WorkspaceConfig] {
  const name = requested ?? config.activeWorkspace
  if (!name) {
    throw new Error('No workspace selected. Pass --workspace or run `ai workspace use <name>`.')
  }

  const workspace = config.workspaces[name]
  if (!workspace) {
    throw new Error(`Workspace "${name}" does not exist.`)
  }

  return [name, workspace]
}

function normalizeConfig(config: Partial<HarnessConfig>): HarnessConfig {
  return {
    activeProfile: config.activeProfile,
    activeWorkspace: config.activeWorkspace,
    profiles: config.profiles ?? {},
    skills: config.skills ?? {},
    workspaces: config.workspaces ?? {},
  }
}
