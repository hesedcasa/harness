import {HostConfigCommand} from '@hesed/plugin-lib'
import {Args, Flags} from '@oclif/core'

import {loadConfig, resolveWorkspace} from '../../lib/config.js'
import {findHostTool} from '../../lib/host-tools.js'
import {callTool, TOOL_NAMES, type ToolName} from '../../lib/tools.js'

export default class ToolsCall extends HostConfigCommand {
  /* eslint-disable perfectionist/sort-objects */
  static args = {
    tool: Args.string({description: 'Tool name: a built-in workspace tool or a host command', required: true}),
    input: Args.string({description: 'Tool input, or arguments for a host command'}),
  }
  /* eslint-enable perfectionist/sort-objects */
  static description = 'Call a harness tool: a built-in workspace tool or any host command'
  static flags = {
    workspace: Flags.string({char: 'w', description: 'Workspace name to use'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ToolsCall)

    if (TOOL_NAMES.includes(args.tool as ToolName)) {
      const config = await loadConfig()
      const [, workspace] = resolveWorkspace(config, flags.workspace)
      const output = await callTool(workspace.path, args.tool as ToolName, args.input ?? '')
      this.log(output)
      return
    }

    const hostTool = findHostTool(this.config, args.tool)
    if (!hostTool) {
      throw new Error(
        `Unknown tool "${args.tool}". Built-in tools: ${TOOL_NAMES.join(', ')}. Run \`ai tools list\` to see host commands.`,
      )
    }

    const argv = args.input ? args.input.split(/\s+/).filter(Boolean) : []
    await this.config.runCommand(hostTool.id, argv)
  }
}
