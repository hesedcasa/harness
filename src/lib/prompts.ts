import type {Config} from '@oclif/core'

import {createProfileManager, type Profiles} from '@hesed/plugin-lib'
import {access} from 'node:fs/promises'
import {join} from 'node:path'

/** A user-defined prompt saved locally for later reuse. */
type PromptConfig = {
  body: string
  description?: string
}

/** Prompts persist in their own plugin-lib profile store, keyed by name. */
const PROMPTS_FILE = 'ai-prompts.json'

function manager(config: Config) {
  return createProfileManager<PromptConfig>(config, undefined, PROMPTS_FILE)
}

/**
 * Read every saved prompt. plugin-lib's `readProfiles` throws when the store
 * file does not exist yet; treat only that case as an empty collection. Any
 * other failure (e.g. malformed JSON) is rethrown so a subsequent save can't
 * silently overwrite an unreadable store and lose existing prompts.
 */
export async function readPrompts(config: Config): Promise<Profiles<PromptConfig>> {
  try {
    return await manager(config).readProfiles()
  } catch (error) {
    try {
      await access(join(config.configDir, PROMPTS_FILE))
    } catch {
      return {}
    }

    throw error
  }
}

export async function savePrompts(config: Config, prompts: Profiles<PromptConfig>): Promise<void> {
  await manager(config).saveProfiles(prompts)
}

export function resolvePrompt(prompts: Profiles<PromptConfig>, name: string): [string, PromptConfig] {
  const prompt = prompts[name]
  if (!prompt) {
    throw new Error(`Prompt "${name}" does not exist.`)
  }

  return [name, prompt]
}
