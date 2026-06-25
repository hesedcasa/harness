import {Args, Command} from '@oclif/core'

import {loadConfig, resolveWorkspace} from '../../lib/config.js'

export default class WorkspaceShow extends Command {
  static args = {
    name: Args.string({description: 'Workspace name. Defaults to active workspace.'}),
  }
  static description = 'Show one workspace'

  async run(): Promise<void> {
    const {args} = await this.parse(WorkspaceShow)
    const config = await loadConfig()
    const [name, workspace] = resolveWorkspace(config, args.name)
    this.log(JSON.stringify({name, ...workspace}, null, 2))
  }
}
