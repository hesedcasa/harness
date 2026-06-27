import {HostConfigCommand} from '@hesed/plugin-lib'
import {Args, Flags} from '@oclif/core'

import {loadConfig, resolveWorkspace} from '../../lib/config.js'
import {findHostTool} from '../../lib/host-tools.js'
import {callTool, TOOL_NAMES, type ToolName} from '../../lib/tools.js'

export default class ToolsCall extends HostConfigCommand {
  static args = {
    tool: Args.string({description: 'Tool name: a built-in workspace tool or a host command', required: true}),
  }
  static description = 'Call a harness tool: a built-in workspace tool or any host command'
  static examples = [
    '<%= config.bin %> <%= command.id %> read src/index.ts',
    '<%= config.bin %> <%= command.id %> grep "needle with spaces"',
    '<%= config.bin %> <%= command.id %> profile:add -- fast --provider openai --model gpt-4.1',
  ]
  static flags = {
    workspace: Flags.string({char: 'w', description: 'Workspace name to use'}),
  }
  // Accept arbitrary trailing tokens so host-command arguments and flags can be
  // forwarded verbatim. The shell tokenises them and oclif preserves quoting, so
  // no fragile string splitting is needed; pass host-command flags after `--`.
  static strict = false

  async run(): Promise<void> {
    const {args, argv, flags} = await this.parse(ToolsCall)
    // `argv` is the full positional list (including any tokens after `--`) with
    // the tool name first; everything after it is the tool's own input/args.
    const rest = (argv as string[]).slice(1)

    if (TOOL_NAMES.includes(args.tool as ToolName)) {
      if (findHostTool(this.config, args.tool)) {
        this.warn(
          `Built-in tool "${args.tool}" shadows a host command with the same name. ` +
            `Run \`${this.config.bin} ${args.tool}\` directly to invoke the host command.`,
        )
      }

      const config = await loadConfig()
      const [, workspace] = resolveWorkspace(config, flags.workspace)
      const output = await callTool(workspace.path, args.tool as ToolName, rest.join(' '))
      this.log(output)
      return
    }

    const hostTool = findHostTool(this.config, args.tool)
    if (!hostTool) {
      throw new Error(
        `Unknown tool "${args.tool}". Built-in tools: ${TOOL_NAMES.join(', ')}. Run \`${this.config.bin} tools list\` to see host commands.`,
      )
    }

    // Forward the remaining tokens untouched; the host command parses its own flags.
    await this.config.runCommand(hostTool.id, rest)
  }
}
