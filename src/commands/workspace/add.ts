import {Args, Command, Flags} from '@oclif/core'
import {mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'

import {getSandboxRoot, updateConfig, type WorkspaceMode} from '../../lib/config.js'
import {cloneRepository} from '../../lib/git.js'

export default class WorkspaceAdd extends Command {
  static args = {
    name: Args.string({description: 'Workspace name', required: true}),
  }
  static description = 'Create or update a workspace'
  static flags = {
    branch: Flags.string({description: 'Git branch to clone or record'}),
    clone: Flags.boolean({description: 'Clone --repo into the workspace path'}),
    mode: Flags.string({default: 'local', description: 'Workspace mode', options: ['local', 'sandbox']}),
    path: Flags.string({description: 'Workspace path. Defaults to cwd for local or harness sandbox root for sandbox.'}),
    repo: Flags.string({description: 'Git repository URL stored in workspace config'}),
    use: Flags.boolean({description: 'Set this workspace active'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(WorkspaceAdd)
    const mode = flags.mode as WorkspaceMode
    const path = resolve(flags.path ?? (mode === 'sandbox' ? `${getSandboxRoot()}/${args.name}` : process.cwd()))

    if (flags.clone) {
      if (!flags.repo) {
        throw new Error('--clone requires --repo')
      }

      await cloneRepository(flags.repo, path, flags.branch)
    } else {
      await mkdir(path, {recursive: true})
    }

    await updateConfig((config) => {
      config.workspaces[args.name] = {
        gitBranch: flags.branch,
        gitRepo: flags.repo,
        mode,
        path,
      }

      if (flags.use || !config.activeWorkspace) {
        config.activeWorkspace = args.name
      }
    })

    this.log(`workspace ${args.name} saved at ${path}`)
  }
}
