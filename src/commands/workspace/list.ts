import {Command} from '@oclif/core'

import {loadConfig} from '../../lib/config.js'

export default class WorkspaceList extends Command {
  static description = 'List configured workspaces'

  async run(): Promise<void> {
    const config = await loadConfig()
    const rows = Object.entries(config.workspaces)
    if (rows.length === 0) {
      this.log('no workspaces configured')
      return
    }

    for (const [name, workspace] of rows) {
      const marker = config.activeWorkspace === name ? '*' : ' '
      const repo = workspace.gitRepo ? ` repo=${workspace.gitRepo}` : ''
      this.log(`${marker} ${name} ${workspace.mode} ${workspace.path}${repo}`)
    }
  }
}
