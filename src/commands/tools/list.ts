import {Command} from '@oclif/core'

import {TOOL_NAMES} from '../../lib/tools.js'

export default class ToolsList extends Command {
  static description = 'List built-in local tools available to the harness'

  async run(): Promise<void> {
    for (const tool of TOOL_NAMES) {
      this.log(tool)
    }
  }
}
