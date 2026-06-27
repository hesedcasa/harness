import {HostConfigCommand} from '@hesed/plugin-lib'

import {listHostTools} from '../../lib/host-tools.js'
import {TOOL_NAMES} from '../../lib/tools.js'

export default class ToolsList extends HostConfigCommand {
  static description = 'List the tools available to the harness: built-in workspace tools and every host command'

  async run(): Promise<void> {
    await this.parse(ToolsList)

    this.log('Built-in tools:')
    for (const tool of TOOL_NAMES) {
      this.log(`  ${tool}`)
    }

    const hostTools = listHostTools(this.config)
    this.log('')
    this.log('Host tools:')
    if (hostTools.length === 0) {
      this.log('  (none)')
      return
    }

    for (const tool of hostTools) {
      this.log(tool.summary ? `  ${tool.name} - ${tool.summary}` : `  ${tool.name}`)
    }
  }
}
