import {spawn} from 'node:child_process'
import {join} from 'node:path'

import {getHarnessHome, type ProviderProfile, type SkillConfig, type WorkspaceConfig} from './config.js'

export type PiLaunchOptions = {
  dryRun?: boolean
  message?: string
  profile: ProviderProfile
  profileName: string
  skills: Record<string, SkillConfig>
  workspace: WorkspaceConfig
  workspaceName: string
}

export async function launchPi(options: PiLaunchOptions): Promise<string[]> {
  const {args, displayArgs} = buildPiArgs(options)
  if (options.message) {
    args.push(options.message)
    displayArgs.push(options.message)
  }

  if (options.dryRun) {
    return displayArgs
  }

  await runPi(args, {
    cwd: options.workspace.path,
    env: {
      AI_HARNESS_MODEL: options.profile.model,
      AI_HARNESS_PROFILE: options.profileName,
      AI_HARNESS_PROVIDER: options.profile.provider,
      AI_HARNESS_WORKSPACE: options.workspaceName,
      ...(options.profile.apiKeyEnv ? {AI_HARNESS_API_KEY_ENV: options.profile.apiKeyEnv} : {}),
      ...(options.profile.baseUrl ? {AI_HARNESS_BASE_URL: options.profile.baseUrl} : {}),
      PI_CODING_AGENT_DIR: join(getHarnessHome(), 'pi-agent'),
    },
  })
  return displayArgs
}

function buildPiArgs(options: PiLaunchOptions): {args: string[]; displayArgs: string[]} {
  const args = ['--print', '--provider', options.profile.provider, '--model', options.profile.model]
  const displayArgs = [...args]
  const apiKey = options.profile.apiKeyEnv ? process.env[options.profile.apiKeyEnv] : undefined
  if (apiKey) {
    args.push('--api-key', apiKey)
    displayArgs.push('--api-key', `<${options.profile.apiKeyEnv}>`)
  }

  for (const skill of Object.values(options.skills)) {
    args.push('--skill', skill.path)
    displayArgs.push('--skill', skill.path)
  }

  return {args, displayArgs}
}

function runPi(args: string[], options: {cwd: string; env: Record<string, string>}): Promise<void> {
  return new Promise((resolve, reject) => {
    const bin = join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'pi.cmd' : 'pi')
    const child = spawn(bin, args, {
      cwd: options.cwd,
      env: {...process.env, ...options.env},
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`pi exited with code ${code}`))
      }
    })
  })
}
