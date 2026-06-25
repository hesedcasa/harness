import {Args, Command} from '@oclif/core'

import {updateConfig} from '../../lib/config.js'

export default class ProfileUse extends Command {
  static args = {
    name: Args.string({description: 'Profile name', required: true}),
  }
  static description = 'Select the default LLM provider profile'

  async run(): Promise<void> {
    const {args} = await this.parse(ProfileUse)
    await updateConfig((config) => {
      if (!config.profiles[args.name]) {
        throw new Error(`Profile "${args.name}" does not exist.`)
      }

      config.activeProfile = args.name
    })
    this.log(`active profile: ${args.name}`)
  }
}
