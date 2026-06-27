import {Args, Command, Flags} from '@oclif/core'

import {loadConfig, resolveProfile, resolveWorkspace} from '../../lib/config.js'
import {launchPi} from '../../lib/pi.js'
import {readPrompts, resolvePrompt} from '../../lib/prompts.js'

export default class PromptRun extends Command {
  static args = {
    name: Args.string({description: 'Prompt name', required: true}),
  }
  static description = 'Execute a saved prompt through a selected profile and workspace'
  static flags = {
    'dry-run': Flags.boolean({description: 'Print the resolved launch context without starting Pi'}),
    profile: Flags.string({char: 'p', description: 'Profile name to use'}),
    workspace: Flags.string({char: 'w', description: 'Workspace name to use'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PromptRun)
    const harness = await loadConfig()
    const prompts = await readPrompts(this.config)
    const [, prompt] = resolvePrompt(prompts, args.name)
    const [profileName, profile] = resolveProfile(harness, flags.profile)
    const [workspaceName, workspace] = resolveWorkspace(harness, flags.workspace)
    const piArgs = await launchPi({
      dryRun: flags['dry-run'],
      message: prompt.body,
      profile,
      profileName,
      skills: harness.skills,
      workspace,
      workspaceName,
    })

    if (flags['dry-run']) {
      this.log(
        JSON.stringify(
          {
            piArgs,
            profile: {name: profileName, ...profile},
            prompt: {name: args.name, ...prompt},
            workspace: {name: workspaceName, ...workspace},
          },
          null,
          2,
        ),
      )
    }
  }
}
