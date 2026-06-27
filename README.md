# harness

Extensible CLI harness for running configurable AI coding agents

[![Version](https://img.shields.io/npm/v/@hesed/harness.svg)](https://npmjs.org/package/@hesed/harness)
[![Downloads/week](https://img.shields.io/npm/dw/@hesed/harness.svg)](https://npmjs.org/package/@hesed/harness)

## Quick start

```sh-session
$ ai profile add fast --provider openai --model gpt-4.1 --api openai-responses --api-key-env OPENAI_API_KEY --use
$ ai workspace add app --mode sandbox --repo https://github.com/example/app.git --clone --use
$ ai skills add review ./skills/review/SKILL.md --description "Code review workflow"
$ ai lsp list --workspace app
$ ai tools list
$ ai run "Inspect the project and summarize the architecture" --profile fast --workspace app
```

Config is stored in `~/.ai-harness/config.json` by default. Set `HARNESS_HOME` to use a different config root, which is useful for tests or separate environments.

<!-- toc -->
* [harness](#harness)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @hesed/harness
$ ai COMMAND
running command...
$ ai (--version)
@hesed/harness/0.1.0 linux-x64 node-v22.22.3
$ ai --help [COMMAND]
USAGE
  $ ai COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ai lsp list`](#ai-lsp-list)
* [`ai profile add NAME`](#ai-profile-add-name)
* [`ai profile list`](#ai-profile-list)
* [`ai profile show [NAME]`](#ai-profile-show-name)
* [`ai profile use NAME`](#ai-profile-use-name)
* [`ai run [MESSAGE]`](#ai-run-message)
* [`ai skills add NAME PATH`](#ai-skills-add-name-path)
* [`ai skills list`](#ai-skills-list)
* [`ai tools call TOOL [INPUT]`](#ai-tools-call-tool-input)
* [`ai tools list`](#ai-tools-list)
* [`ai workspace add NAME`](#ai-workspace-add-name)
* [`ai workspace list`](#ai-workspace-list)
* [`ai workspace show [NAME]`](#ai-workspace-show-name)
* [`ai workspace use NAME`](#ai-workspace-use-name)

## `ai lsp list`

Detect language servers for a workspace

```
USAGE
  $ ai lsp list [-w <value>]

FLAGS
  -w, --workspace=<value>  Workspace name to inspect

DESCRIPTION
  Detect language servers for a workspace
```

_See code: [src/commands/lsp/list.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/lsp/list.ts)_

## `ai profile add NAME`

Create or update an LLM provider profile

```
USAGE
  $ ai profile add NAME --api
    anthropic-messages|azure-openai-responses|google-generative-ai|google-vertex|mistral|openai-codex-responses|openai-c
    ompletions|openai-responses --model <value> --provider <value> [--api-key-env <value>] [--base-url <value>] [--use]

ARGUMENTS
  NAME  Profile name

FLAGS
  --api=<option>         (required) Provider API adapter
                         <options: anthropic-messages|azure-openai-responses|google-generative-ai|google-vertex|mistral|
                         openai-codex-responses|openai-completions|openai-responses>
  --api-key-env=<value>  Environment variable containing the API key
  --base-url=<value>     Custom provider base URL
  --model=<value>        (required) Model id
  --provider=<value>     (required) Provider id
  --use                  Set this profile active

DESCRIPTION
  Create or update an LLM provider profile
```

_See code: [src/commands/profile/add.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/profile/add.ts)_

## `ai profile list`

List configured LLM provider profiles

```
USAGE
  $ ai profile list

DESCRIPTION
  List configured LLM provider profiles
```

_See code: [src/commands/profile/list.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/profile/list.ts)_

## `ai profile show [NAME]`

Show one LLM provider profile

```
USAGE
  $ ai profile show [NAME]

ARGUMENTS
  [NAME]  Profile name. Defaults to active profile.

DESCRIPTION
  Show one LLM provider profile
```

_See code: [src/commands/profile/show.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/profile/show.ts)_

## `ai profile use NAME`

Select the default LLM provider profile

```
USAGE
  $ ai profile use NAME

ARGUMENTS
  NAME  Profile name

DESCRIPTION
  Select the default LLM provider profile
```

_See code: [src/commands/profile/use.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/profile/use.ts)_

## `ai run [MESSAGE]`

Run the Pi coding agent through a selected harness profile and workspace

```
USAGE
  $ ai run [MESSAGE] [--dry-run] [-p <value>] [-w <value>]

ARGUMENTS
  [MESSAGE]  Prompt to send to the agent

FLAGS
  -p, --profile=<value>    Profile name to use
  -w, --workspace=<value>  Workspace name to use
      --dry-run            Print the resolved launch context without starting Pi

DESCRIPTION
  Run the Pi coding agent through a selected harness profile and workspace
```

_See code: [src/commands/run/index.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/run/index.ts)_

## `ai skills add NAME PATH`

Register a reusable skill for the agent

```
USAGE
  $ ai skills add NAME PATH [-d <value>]

ARGUMENTS
  NAME  Skill name
  PATH  Path to a skill file or directory

FLAGS
  -d, --description=<value>  Short skill description

DESCRIPTION
  Register a reusable skill for the agent
```

_See code: [src/commands/skills/add.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/skills/add.ts)_

## `ai skills list`

List registered skills

```
USAGE
  $ ai skills list

DESCRIPTION
  List registered skills
```

_See code: [src/commands/skills/list.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/skills/list.ts)_

## `ai tools call TOOL [INPUT]`

Call a local harness tool in a selected workspace

```
USAGE
  $ ai tools call TOOL [INPUT] [-w <value>]

ARGUMENTS
  TOOL     Tool name
  [INPUT]  Tool input

FLAGS
  -w, --workspace=<value>  Workspace name to use

DESCRIPTION
  Call a local harness tool in a selected workspace
```

_See code: [src/commands/tools/call.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/tools/call.ts)_

## `ai tools list`

List built-in local tools available to the harness

```
USAGE
  $ ai tools list

DESCRIPTION
  List built-in local tools available to the harness
```

_See code: [src/commands/tools/list.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/tools/list.ts)_

## `ai workspace add NAME`

Create or update a workspace

```
USAGE
  $ ai workspace add NAME [--branch <value>] [--clone] [--mode local|sandbox] [--path <value>] [--repo <value>]
    [--use]

ARGUMENTS
  NAME  Workspace name

FLAGS
  --branch=<value>  Git branch to clone or record
  --clone           Clone --repo into the workspace path
  --mode=<option>   [default: local] Workspace mode
                    <options: local|sandbox>
  --path=<value>    Workspace path. Defaults to cwd for local or harness sandbox root for sandbox.
  --repo=<value>    Git repository URL stored in workspace config
  --use             Set this workspace active

DESCRIPTION
  Create or update a workspace
```

_See code: [src/commands/workspace/add.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/workspace/add.ts)_

## `ai workspace list`

List configured workspaces

```
USAGE
  $ ai workspace list

DESCRIPTION
  List configured workspaces
```

_See code: [src/commands/workspace/list.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/workspace/list.ts)_

## `ai workspace show [NAME]`

Show one workspace

```
USAGE
  $ ai workspace show [NAME]

ARGUMENTS
  [NAME]  Workspace name. Defaults to active workspace.

DESCRIPTION
  Show one workspace
```

_See code: [src/commands/workspace/show.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/workspace/show.ts)_

## `ai workspace use NAME`

Select the default workspace

```
USAGE
  $ ai workspace use NAME

ARGUMENTS
  NAME  Workspace name

DESCRIPTION
  Select the default workspace
```

_See code: [src/commands/workspace/use.ts](https://github.com/hesedcasa/harness/blob/v0.1.0/src/commands/workspace/use.ts)_
<!-- commandsstop -->
