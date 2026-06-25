import {spawn} from 'node:child_process'
import {mkdir} from 'node:fs/promises'
import {dirname} from 'node:path'

export async function cloneRepository(repo: string, target: string, branch?: string): Promise<void> {
  await mkdir(dirname(target), {recursive: true})
  const args = ['clone']
  if (branch) {
    args.push('--branch', branch)
  }

  args.push(repo, target)
  await run('git', args)
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {stdio: 'inherit'})
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })
}
