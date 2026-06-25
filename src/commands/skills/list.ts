import {Command} from '@oclif/core'

import {loadConfig} from '../../lib/config.js'

export default class SkillsList extends Command {
  static description = 'List registered skills'

  async run(): Promise<void> {
    const config = await loadConfig()
    const rows = Object.entries(config.skills)
    if (rows.length === 0) {
      this.log('no skills configured')
      return
    }

    for (const [name, skill] of rows) {
      const description = skill.description ? ` - ${skill.description}` : ''
      this.log(`${name}: ${skill.path}${description}`)
    }
  }
}
