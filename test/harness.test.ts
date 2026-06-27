import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

describe('harness', () => {
  let home: string
  let workspace: string
  let previousHome: string | undefined
  let previousConfigDir: string | undefined

  beforeEach(async () => {
    previousHome = process.env.HARNESS_HOME
    previousConfigDir = process.env.AI_CONFIG_DIR
    home = await mkdtemp(join(tmpdir(), 'ai-harness-home-'))
    workspace = await mkdtemp(join(tmpdir(), 'ai-harness-workspace-'))
    process.env.HARNESS_HOME = home
    // plugin-lib stores prompts under oclif's configDir; pin it to the temp home.
    process.env.AI_CONFIG_DIR = home
  })

  afterEach(async () => {
    if (previousHome === undefined) {
      delete process.env.HARNESS_HOME
    } else {
      process.env.HARNESS_HOME = previousHome
    }

    if (previousConfigDir === undefined) {
      delete process.env.AI_CONFIG_DIR
    } else {
      process.env.AI_CONFIG_DIR = previousConfigDir
    }

    await rm(home, {force: true, recursive: true})
    await rm(workspace, {force: true, recursive: true})
  })

  it('configures profiles and workspaces, then resolves them for run --dry-run', async () => {
    await runCommand(
      'profile add fast --provider openai --model gpt-4.1 --api openai-responses --api-key-env OPENAI_API_KEY --use',
    )
    await runCommand(`workspace add app --mode sandbox --path ${workspace} --repo https://example.com/repo.git --use`)

    const {stdout} = await runCommand('run "list files" --dry-run --profile fast --workspace app')
    const resolved = JSON.parse(stdout)
    expect(resolved.profile).to.include({api: 'openai-responses', model: 'gpt-4.1', name: 'fast', provider: 'openai'})
    expect(resolved.workspace).to.include({
      gitRepo: 'https://example.com/repo.git',
      mode: 'sandbox',
      name: 'app',
      path: workspace,
    })
    expect(resolved.piArgs).to.deep.equal(['--print', '--provider', 'openai', '--model', 'gpt-4.1', 'list files'])
  })

  it('registers skills and calls local workspace tools', async () => {
    const skill = join(workspace, 'SKILL.md')
    await writeFile(skill, '# Skill\n', 'utf8')
    await writeFile(join(workspace, 'hello.txt'), 'hello harness\n', 'utf8')

    await runCommand(`workspace add app --path ${workspace} --use`)
    await runCommand(`skills add review ${skill} --description "Review code"`)

    const skills = await runCommand('skills list')
    expect(skills.stdout).to.contain('review')
    expect(skills.stdout).to.contain('Review code')

    const tools = await runCommand('tools call read hello.txt --workspace app')
    expect(tools.stdout).to.equal('hello harness\n\n')

    await runCommand('profile add fast --provider anthropic --model claude-sonnet --api anthropic-messages --use')
    const run = await runCommand('run "use skill" --dry-run')
    expect(JSON.parse(run.stdout).piArgs).to.deep.equal([
      '--print',
      '--provider',
      'anthropic',
      '--model',
      'claude-sonnet',
      '--skill',
      skill,
      'use skill',
    ])

    const config = JSON.parse(await readFile(join(home, 'config.json'), 'utf8'))
    expect(config.skills.review.path).to.equal(skill)
  })

  it('lists built-in tools alongside every host command', async () => {
    const {stdout} = await runCommand('tools list')
    expect(stdout).to.contain('Built-in tools:')
    expect(stdout).to.contain('grep')
    expect(stdout).to.contain('Host tools:')
    // Host commands are surfaced via plugin-lib's command enumeration.
    expect(stdout).to.contain('profile add')
    expect(stdout).to.contain('workspace list')
    expect(stdout).to.contain('tools call')
  })

  it('calls a host command tool through tools call', async () => {
    await runCommand('profile add fast --provider openai --model gpt-4.1 --api openai-responses --use')

    const {stdout} = await runCommand('tools call "profile list"')
    expect(stdout).to.contain('fast')
  })

  it('forwards host-command arguments verbatim, preserving spaces', async () => {
    // The argument after `--` contains a space; it must round-trip as one token
    // rather than being split into several.
    await runCommand('tools call profile:add -- spaced --provider openai --model "gpt 4 turbo" --api openai-responses')

    const config = JSON.parse(await readFile(join(home, 'config.json'), 'utf8'))
    expect(config.profiles.spaced.model).to.equal('gpt 4 turbo')
  })

  it('rejects an unknown tool name', async () => {
    const {error} = await runCommand('tools call does-not-exist')
    expect(error?.message).to.contain('Unknown tool')
  })

  it('saves, lists, views, edits, executes, and deletes prompts', async () => {
    await runCommand('prompt add summary "Summarize the architecture" --description "Project summary"')

    const list = await runCommand('prompt list')
    expect(list.stdout).to.contain('summary')
    expect(list.stdout).to.contain('Project summary')

    const show = await runCommand('prompt show summary')
    const shown = JSON.parse(show.stdout)
    expect(shown).to.include({body: 'Summarize the architecture', description: 'Project summary', name: 'summary'})

    await runCommand('prompt edit summary "Summarize the tests" --description "Test summary"')
    const edited = JSON.parse((await runCommand('prompt show summary')).stdout)
    expect(edited).to.include({body: 'Summarize the tests', description: 'Test summary'})

    await runCommand('profile add fast --provider openai --model gpt-4.1 --api openai-responses --use')
    await runCommand(`workspace add app --path ${workspace} --use`)
    const run = await runCommand('prompt run summary --dry-run')
    const resolved = JSON.parse(run.stdout)
    expect(resolved.prompt).to.include({body: 'Summarize the tests', name: 'summary'})
    expect(resolved.piArgs).to.deep.equal([
      '--print',
      '--provider',
      'openai',
      '--model',
      'gpt-4.1',
      'Summarize the tests',
    ])

    await runCommand('prompt delete summary')
    expect((await runCommand('prompt list')).stdout).to.contain('no prompts saved')
    expect((await runCommand('prompt show summary')).error?.message).to.contain('does not exist')
  })
})
