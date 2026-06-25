import {Args, Command, Flags} from '@oclif/core'

import {type ProviderApi, updateConfig} from '../../lib/config.js'

const apis: ProviderApi[] = [
  'anthropic-messages',
  'azure-openai-responses',
  'google-generative-ai',
  'google-vertex',
  'mistral',
  'openai-codex-responses',
  'openai-completions',
  'openai-responses',
]

export default class ProfileAdd extends Command {
  static args = {
    name: Args.string({description: 'Profile name', required: true}),
  }
  static description = 'Create or update an LLM provider profile'
  static flags = {
    api: Flags.string({description: 'Provider API adapter', options: apis, required: true}),
    'api-key-env': Flags.string({description: 'Environment variable containing the API key'}),
    'base-url': Flags.string({description: 'Custom provider base URL'}),
    model: Flags.string({description: 'Model id', required: true}),
    provider: Flags.string({description: 'Provider id', required: true}),
    use: Flags.boolean({description: 'Set this profile active'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ProfileAdd)
    await updateConfig((config) => {
      config.profiles[args.name] = {
        api: flags.api as ProviderApi,
        apiKeyEnv: flags['api-key-env'],
        baseUrl: flags['base-url'],
        model: flags.model,
        provider: flags.provider,
      }

      if (flags.use || !config.activeProfile) {
        config.activeProfile = args.name
      }
    })

    this.log(`profile ${args.name} saved`)
  }
}
