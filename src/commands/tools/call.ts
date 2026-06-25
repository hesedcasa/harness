import {Args, Command, Flags} from '@oclif/core'

import {loadConfig, resolveWorkspace} from '../../lib/config.js'
import {assertToolName, callTool} from '../../lib/tools.js'

export default class ToolsCall extends Command {
  /* eslint-disable perfectionist/sort-objects */
  static args = {
    tool: Args.string({description: 'Tool name', required: true}),
    input: Args.string({description: 'Tool input'}),
  }
  /* eslint-enable perfectionist/sort-objects */
  static description = 'Call a local harness tool in a selected workspace'
  static flags = {
    workspace: Flags.string({char: 'w', description: 'Workspace name to use'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ToolsCall)
    const config = await loadConfig()
    const [, workspace] = resolveWorkspace(config, flags.workspace)
    const output = await callTool(workspace.path, assertToolName(args.tool), args.input ?? '')
    this.log(output)
  }
}
