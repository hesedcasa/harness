import {Args, Command, Flags} from '@oclif/core'
import {access} from 'node:fs/promises'
import {resolve} from 'node:path'

import {updateConfig} from '../../lib/config.js'

export default class SkillsAdd extends Command {
  static args = {
    name: Args.string({description: 'Skill name', required: true}),
    path: Args.string({description: 'Path to a skill file or directory', required: true}),
  }
  static description = 'Register a reusable skill for the agent'
  static flags = {
    description: Flags.string({char: 'd', description: 'Short skill description'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(SkillsAdd)
    const path = resolve(args.path)
    await access(path)
    await updateConfig((config) => {
      config.skills[args.name] = {description: flags.description, path}
    })
    this.log(`skill ${args.name} saved`)
  }
}
