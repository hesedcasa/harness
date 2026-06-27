import {Args, Command} from '@oclif/core'

import {readPrompts, resolvePrompt, savePrompts} from '../../lib/prompts.js'

export default class PromptDelete extends Command {
  static aliases = ['prompt rm']
  static args = {
    name: Args.string({description: 'Prompt name', required: true}),
  }
  static description = 'Delete a saved prompt'

  async run(): Promise<void> {
    const {args} = await this.parse(PromptDelete)
    const prompts = await readPrompts(this.config)
    const [name] = resolvePrompt(prompts, args.name)
    delete prompts[name]
    await savePrompts(this.config, prompts)
    this.log(`prompt ${name} deleted`)
  }
}
