// @ts-check
//
// Markdownlint rule to detect shortcut reference links like [abc] and convert
// them to collapsed form [abc][].
//
// The shortcut form is valid CommonMark but can confuse some tools. The
// collapsed form is unambiguous.

import {
  filterByTypes,
  getDescendantsByType,
} from 'markdownlint-rule-helpers/micromark';

const singleWordRe = /^\S+$/;

/** @type {import("markdownlint").Rule} */
export default {
  names: ['no-shortcut-ref-link'],
  description:
    'Shortcut reference links should use collapsed form, e.g. [text][] instead of [text]',
  tags: ['custom', 'links'],
  parser: 'micromark',
  function: function noShortcutRefLink(params, onError) {
    const links = filterByTypes(params.parsers.micromark.tokens, ['link']);

    for (const link of links) {
      const hasReference = getDescendantsByType(link, ['reference']).length > 0;
      const hasResource = getDescendantsByType(link, ['resource']).length > 0;

      if (hasReference || hasResource) continue;

      const labelTextToken = getDescendantsByType(link, [
        'label',
        'labelText',
      ])[0];
      if (!labelTextToken) continue;

      const labelText = labelTextToken.text;

      if (!singleWordRe.test(labelText)) continue;

      if (link.startLine !== link.endLine) continue;

      onError({
        lineNumber: link.startLine,
        detail: `Use [${labelText}][] instead of [${labelText}]`,
        context: params.lines[link.startLine - 1].trim(),
        range: [link.startColumn, link.endColumn - link.startColumn],
        fixInfo: {
          editColumn: link.endColumn,
          insertText: '[]',
        },
      });
    }
  },
};
