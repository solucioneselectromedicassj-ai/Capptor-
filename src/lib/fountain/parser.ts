import { Fountain } from 'fountain-js'
import type { IntExt, ParsedScene } from '@/types'

const HEADING_RE =
  /^(INT\.?\/EXT\.?|EXT\.?\/INT\.?|I\/E\.?|INT\.?|EXT\.?|EST\.?)\s*[.-]?\s*(.+)$/i

function parseHeadingPrefix(raw: string): { intExt: IntExt; rest: string } {
  const match = raw.trim().match(HEADING_RE)
  if (!match) return { intExt: 'INT', rest: raw.trim() }
  const prefix = match[1].toUpperCase().replace(/\.$/, '')
  const intExt: IntExt =
    prefix.includes('/') || prefix === 'I/E'
      ? 'INT/EXT'
      : prefix.startsWith('EXT') || prefix === 'EST'
        ? 'EXT'
        : 'INT'
  return { intExt, rest: match[2].trim() }
}

function splitLocationAndTime(rest: string): { location: string; timeOfDay: string } {
  const parts = rest.split(/\s+-\s+/)
  if (parts.length >= 2) {
    return {
      location: parts.slice(0, -1).join(' - ').trim(),
      timeOfDay: parts[parts.length - 1].trim().toUpperCase(),
    }
  }
  return { location: rest.trim(), timeOfDay: 'DÍA' }
}

export function sceneMatchKey(intExt: string, location: string, timeOfDay: string): string {
  return `${intExt}|${location.trim().toLowerCase()}|${timeOfDay.trim().toLowerCase()}`
}

interface ScenAccumulator {
  intExt: IntExt
  location: string
  timeOfDay: string
  characters: Set<string>
  actionLines: string[]
  rawLines: string[]
}

function estimatePages(lineCount: number): number {
  const raw = lineCount / 55
  return Math.max(0.125, Math.round(raw * 8) / 8)
}

function finalizeScene(acc: ScenAccumulator, sceneNumber: number): ParsedScene {
  const synopsis = acc.actionLines.slice(0, 2).join(' ').slice(0, 220)
  return {
    tempId: crypto.randomUUID(),
    sceneNumber,
    intExt: acc.intExt,
    location: acc.location,
    timeOfDay: acc.timeOfDay,
    synopsis,
    characters: Array.from(acc.characters),
    rawText: acc.rawLines.join('\n'),
    pageEstimate: estimatePages(acc.rawLines.length),
    matchKey: sceneMatchKey(acc.intExt, acc.location, acc.timeOfDay),
  }
}

/** Parses Fountain source into scenes with a stable matchKey used to preserve UUIDs across edits. */
export function parseFountainToScenes(fountain: string): ParsedScene[] {
  const { tokens } = new Fountain().parse(fountain, true)
  const scenes: ParsedScene[] = []
  let current: ScenAccumulator | null = null

  for (const token of tokens) {
    if (token.type === 'scene_heading') {
      if (current) scenes.push(finalizeScene(current, scenes.length + 1))
      const { intExt, rest } = parseHeadingPrefix(token.text ?? '')
      const { location, timeOfDay } = splitLocationAndTime(rest)
      current = {
        intExt,
        location,
        timeOfDay,
        characters: new Set(),
        actionLines: [],
        rawLines: [token.text ?? ''],
      }
      continue
    }
    if (!current) continue

    switch (token.type) {
      case 'action':
        if (token.text?.trim()) {
          current.actionLines.push(token.text.trim())
          current.rawLines.push(token.text)
        }
        break
      case 'character': {
        const name = (token.text ?? '').replace(/\(.*?\)/g, '').replace(/^@/, '').trim()
        if (name) current.characters.add(name)
        current.rawLines.push((token.text ?? '').toUpperCase())
        break
      }
      case 'dialogue':
        current.rawLines.push(token.text ?? '')
        break
      case 'parenthetical':
        current.rawLines.push(`(${token.text ?? ''})`)
        break
      case 'transition':
        current.rawLines.push((token.text ?? '').toUpperCase())
        break
      case 'lyrics':
        current.rawLines.push(token.text ?? '')
        break
      default:
        break
    }
  }
  if (current) scenes.push(finalizeScene(current, scenes.length + 1))

  return scenes
}
