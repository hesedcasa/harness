import {Command} from '@oclif/core'

import {loadConfig} from '../../lib/config.js'

export default class ProfileList extends Command {
  static description = 'List configured LLM provider profiles'

  async run(): Promise<void> {
    const config = await loadConfig()
    const rows = Object.entries(config.profiles)
    if (rows.length === 0) {
      this.log('no profiles configured')
      return
    }

    for (const [name, profile] of rows) {
      const marker = config.activeProfile === name ? '*' : ' '
      this.log(`${marker} ${name} ${profile.provider}/${profile.model} ${profile.api}`)
    }
  }
}
