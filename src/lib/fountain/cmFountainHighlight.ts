import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view'

const HEADING_RE = /^\s*(INT\.?\/EXT\.?|EXT\.?\/INT\.?|I\/E\.?|INT\.?|EXT\.?|EST\.?)[. ].+$/i
const TRANSITION_RE = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9 ]{2,30}:$/
const CHARACTER_RE = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9 .'()-]{0,40}$/

const headingMark = Decoration.line({ class: 'cm-fountain-heading' })
const transitionMark = Decoration.line({ class: 'cm-fountain-transition' })
const characterMark = Decoration.line({ class: 'cm-fountain-character' })

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    let pos = from
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos)
      const text = line.text.trim()
      if (text) {
        if (HEADING_RE.test(text)) builder.add(line.from, line.from, headingMark)
        else if (TRANSITION_RE.test(text)) builder.add(line.from, line.from, transitionMark)
        else if (CHARACTER_RE.test(text) && text === text.toUpperCase() && text.length < 45) {
          builder.add(line.from, line.from, characterMark)
        }
      }
      pos = line.to + 1
    }
  }
  return builder.finish()
}

/** Lightweight, regex-based Fountain highlighting: scene headings, character cues, transitions. */
export function fountainHighlight() {
  return [
    ViewPlugin.fromClass(
      class {
        decorations: DecorationSet
        constructor(view: EditorView) {
          this.decorations = buildDecorations(view)
        }
        update(update: ViewUpdate) {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = buildDecorations(update.view)
          }
        }
      },
      { decorations: (v) => v.decorations },
    ),
    EditorView.baseTheme({
      '.cm-fountain-heading': {
        color: '#f59e0b',
        fontWeight: '700',
      },
      '.cm-fountain-transition': {
        color: '#9ca3af',
        textAlign: 'right',
      },
      '.cm-fountain-character': {
        color: '#22c55e',
        fontWeight: '700',
      },
    }),
  ]
}
