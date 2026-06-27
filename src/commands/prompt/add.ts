import {Args, Command, Flags} from '@oclif/core'

import {readPrompts, savePrompts} from '../../lib/prompts.js'

export default class PromptAdd extends Command {
  static args = {
    // Order is positional: `prompt add <name> <body>`.
    /* eslint-disable perfectionist/sort-objects */
    name: Args.string({description: 'Prompt name', required: true}),
    body: Args.string({description: 'Prompt text to save', required: true}),
    /* eslint-enable perfectionist/sort-objects */
  }
  static description = 'Create or overwrite a saved prompt'
  static flags = {
    description: Flags.string({char: 'd', description: 'Short prompt description'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PromptAdd)
    const prompts = await readPrompts(this.config)
    prompts[args.name] = {body: args.body, description: flags.description}
    await savePrompts(this.config, prompts)
    this.log(`prompt ${args.name} saved`)
  }
}
