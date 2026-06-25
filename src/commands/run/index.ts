import {Args, Command, Flags} from '@oclif/core'

import {loadConfig, resolveProfile, resolveWorkspace} from '../../lib/config.js'
import {launchPi} from '../../lib/pi.js'

export default class Run extends Command {
  static args = {
    message: Args.string({description: 'Prompt to send to the agent'}),
  }
  static description = 'Run the Pi coding agent through a selected harness profile and workspace'
  static flags = {
    'dry-run': Flags.boolean({description: 'Print the resolved launch context without starting Pi'}),
    profile: Flags.string({char: 'p', description: 'Profile name to use'}),
    workspace: Flags.string({char: 'w', description: 'Workspace name to use'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Run)
    const config = await loadConfig()
    const [profileName, profile] = resolveProfile(config, flags.profile)
    const [workspaceName, workspace] = resolveWorkspace(config, flags.workspace)
    const piArgs = await launchPi({
      dryRun: flags['dry-run'],
      message: args.message,
      profile,
      profileName,
      skills: config.skills,
      workspace,
      workspaceName,
    })

    if (flags['dry-run']) {
      this.log(
        JSON.stringify(
          {
            piArgs,
            profile: {name: profileName, ...profile},
            workspace: {name: workspaceName, ...workspace},
          },
          null,
          2,
        ),
      )
    }
  }
}
