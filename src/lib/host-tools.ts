import type {Config} from '@oclif/core'

import {listCommands} from '@hesed/plugin-lib'

/**
 * A host command surfaced to the harness as a callable tool. `id` is the
 * canonical oclif id (`profile:add`); `name` is the same id rendered with the
 * host's configured topic separator (`profile add`) so it matches how the tool
 * is invoked on the command line.
 */
export type HostTool = {
  id: string
  name: string
  summary?: string
}

function describe(summary: unknown, description: unknown): string | undefined {
  if (typeof summary === 'string' && summary.length > 0) {
    return summary
  }

  return typeof description === 'string' && description.length > 0 ? description : undefined
}

function toHostTool(command: {description?: string; id: string; summary?: string}, separator: string): HostTool {
  return {
    id: command.id,
    name: command.id.replaceAll(':', separator),
    summary: describe(command.summary, command.description),
  }
}

/** Normalise a user-supplied tool name to a canonical colon-separated id. */
function canonicalId(name: string): string {
  return name.trim().split(/[\s:]+/).join(':')
}

/**
 * Enumerate every visible, active command on the host CLI's Config as a tool.
 *
 * Built on plugin-lib's `listCommands`, so when called from a command that
 * preserves the live host Config (see `HostConfigCommand`) it includes commands
 * that plugins register dynamically at startup, not just the statically
 * installed ones.
 */
export function listHostTools(config: Config): HostTool[] {
  const separator = config.topicSeparator ?? ':'
  return listCommands(config)
    .map((command) => toHostTool(command, separator))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Resolve a host tool by name, accepting either the canonical colon id
 * (`profile:add`) or the separator-rendered form (`profile add`). Searches the
 * command list directly rather than building the full sorted tool array.
 */
export function findHostTool(config: Config, name: string): HostTool | undefined {
  const canonical = canonicalId(name)
  const command = listCommands(config).find((c) => c.id === canonical)
  return command && toHostTool(command, config.topicSeparator ?? ':')
}
