import {Command} from '@oclif/core'

import {readPrompts} from '../../lib/prompts.js'

export default class PromptList extends Command {
  static description = 'List saved prompts'

  async run(): Promise<void> {
    const prompts = await readPrompts(this.config)
    const rows = Object.entries(prompts)
    if (rows.length === 0) {
      this.log('no prompts saved')
      return
    }

    for (const [name, prompt] of rows) {
      const summary = prompt.description ?? prompt.body.replaceAll(/\s+/g, ' ').trim()
      this.log(`${name}\t${summary}`)
    }
  }
}
