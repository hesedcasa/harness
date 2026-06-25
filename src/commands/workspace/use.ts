import {Args, Command} from '@oclif/core'

import {updateConfig} from '../../lib/config.js'

export default class WorkspaceUse extends Command {
  static args = {
    name: Args.string({description: 'Workspace name', required: true}),
  }
  static description = 'Select the default workspace'

  async run(): Promise<void> {
    const {args} = await this.parse(WorkspaceUse)
    await updateConfig((config) => {
      if (!config.workspaces[args.name]) {
        throw new Error(`Workspace "${args.name}" does not exist.`)
      }

      config.activeWorkspace = args.name
    })
    this.log(`active workspace: ${args.name}`)
  }
}
