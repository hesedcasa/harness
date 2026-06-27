import {Args, Command, Flags} from '@oclif/core'

import {readPrompts, resolvePrompt, savePrompts} from '../../lib/prompts.js'

export default class PromptEdit extends Command {
  static args = {
    // Order is positional: `prompt edit <name> [body]`.
    /* eslint-disable perfectionist/sort-objects */
    name: Args.string({description: 'Prompt name', required: true}),
    body: Args.string({description: 'Replacement prompt text'}),
    /* eslint-enable perfectionist/sort-objects */
  }
  static description = 'Edit a saved prompt'
  static flags = {
    description: Flags.string({char: 'd', description: 'Replacement prompt description'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PromptEdit)
    if (args.body === undefined && flags.description === undefined) {
      this.error('Nothing to update. Pass a new body and/or --description.')
    }

    const prompts = await readPrompts(this.config)
    const [name, prompt] = resolvePrompt(prompts, args.name)
    prompts[name] = {
      body: args.body ?? prompt.body,
      description: flags.description ?? prompt.description,
    }
    await savePrompts(this.config, prompts)
    this.log(`prompt ${name} updated`)
  }
}
