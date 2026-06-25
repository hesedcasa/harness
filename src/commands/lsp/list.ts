import {Command, Flags} from '@oclif/core'

import {loadConfig, resolveWorkspace} from '../../lib/config.js'
import {detectLspServers} from '../../lib/lsp.js'

export default class LspList extends Command {
  static description = 'Detect language servers for a workspace'
  static flags = {
    workspace: Flags.string({char: 'w', description: 'Workspace name to inspect'}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(LspList)
    const config = await loadConfig()
    const [workspaceName, workspace] = resolveWorkspace(config, flags.workspace)
    const servers = await detectLspServers(workspace.path)
    this.log(`workspace: ${workspaceName}`)
    for (const server of servers) {
      const marker = server.detected ? '*' : ' '
      this.log(`${marker} ${server.name} ${server.command} [${server.languages.join(', ')}]`)
    }
  }
}
