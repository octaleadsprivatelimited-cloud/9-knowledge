import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { teluguToEnglish, containsTelugu } from '@/lib/teluguToEnglish';

function getReplacements(doc: import('@tiptap/pm/model').Node, schema: import('@tiptap/pm/model').Schema) {
  const replacements: { pos: number; nodeSize: number; text: string }[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text && containsTelugu(node.text)) {
      try {
        const translated = teluguToEnglish(node.text);
        if (translated && translated !== node.text) {
          replacements.push({ pos, nodeSize: node.nodeSize, text: translated });
        }
      } catch {
        // keep original on any error
      }
    }
  });
  return replacements;
}

/**
 * TipTap extension: converts Telugu script to English (Roman).
 * - Auto-converts after typing/paste via appendTransaction.
 * - Manual: use command transliterateTeluguToEnglish() or toolbar "Telugu → English".
 */
export const TeluguTransliteration = Extension.create({
  name: 'teluguTransliteration',

  addCommands() {
    return {
      transliterateTeluguToEnglish:
        () =>
        ({ editor }) => {
          const { state } = editor;
          const doc = state.doc;
          const replacements = getReplacements(doc, state.schema);
          if (replacements.length === 0) return false;
          replacements.sort((a, b) => b.pos - a.pos);
          let tr = state.tr;
          for (const { pos, nodeSize, text } of replacements) {
            tr = tr.replaceWith(pos, pos + nodeSize, state.schema.text(text));
          }
          editor.view.dispatch(tr);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('teluguTransliteration'),
        appendTransaction(transactions, _oldState, newState) {
          try {
            if (!transactions.some(tr => tr.docChanged)) return null;
            const replacements = getReplacements(newState.doc, newState.schema);
            if (replacements.length === 0) return null;
            replacements.sort((a, b) => b.pos - a.pos);
            let tr = newState.tr;
            for (const { pos, nodeSize, text } of replacements) {
              tr = tr.replaceWith(pos, pos + nodeSize, newState.schema.text(text));
            }
            return tr;
          } catch {
            return null;
          }
        },
      }),
    ];
  },
});
