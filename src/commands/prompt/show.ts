import {Args, Command} from '@oclif/core'

import {readPrompts, resolvePrompt} from '../../lib/prompts.js'

export default class PromptShow extends Command {
  static args = {
    name: Args.string({description: 'Prompt name', required: true}),
  }
  static description = 'View a saved prompt'

  async run(): Promise<void> {
    const {args} = await this.parse(PromptShow)
    const prompts = await readPrompts(this.config)
    const [name, prompt] = resolvePrompt(prompts, args.name)
    this.log(JSON.stringify({name, ...prompt}, null, 2))
  }
}
