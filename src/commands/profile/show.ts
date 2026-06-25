import {Args, Command} from '@oclif/core'

import {loadConfig, resolveProfile} from '../../lib/config.js'

export default class ProfileShow extends Command {
  static args = {
    name: Args.string({description: 'Profile name. Defaults to active profile.'}),
  }
  static description = 'Show one LLM provider profile'

  async run(): Promise<void> {
    const {args} = await this.parse(ProfileShow)
    const config = await loadConfig()
    const [name, profile] = resolveProfile(config, args.name)
    this.log(JSON.stringify({name, ...profile}, null, 2))
  }
}
