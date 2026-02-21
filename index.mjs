// @ts-check
//
// Markdownlint rule to detect shortcut reference links like [abc] and convert
// them to collapsed form [abc][].
//
// The shortcut form is valid CommonMark but can confuse some tools. The
// collapsed form is unambiguous.
//
// Config:
//   check_undefined (default: true) - also flag [word] when no definition exists
//   ignore_pattern (default: none) - regex; labels matching this pattern are skipped

import {
  filterByTypes,
  getDescendantsByType,
} from 'markdownlint-rule-helpers/micromark';

const singleWordRe = /^\S+$/;

function buildIgnoreRe(config) {
  const pattern = config.ignore_pattern;
  if (!pattern) return null;
  return new RegExp(pattern);
}

function reportShortcut(onError, params, labelText, token, ignoreRe) {
  if (!singleWordRe.test(labelText)) return;
  if (labelText.startsWith('!')) return; // GitHub alert syntax, e.g. [!NOTE]
  if (ignoreRe && ignoreRe.test(labelText)) return;
  if (token.startLine !== token.endLine) return;

  onError({
    lineNumber: token.startLine,
    detail: `Use [${labelText}][] instead of [${labelText}]`,
    context: params.lines[token.startLine - 1].trim(),
    range: [token.startColumn, token.endColumn - token.startColumn],
    fixInfo: {
      editColumn: token.endColumn,
      insertText: '[]',
    },
  });
}

/** @type {import("markdownlint").Rule} */
export default {
  names: ['no-shortcut-ref-link'],
  description:
    'Shortcut reference links should use collapsed form, e.g. [text][] instead of [text]',
  tags: ['custom', 'links'],
  parser: 'micromark',
  function: function noShortcutRefLink(params, onError) {
    const tokens = params.parsers.micromark.tokens;
    const ignoreRe = buildIgnoreRe(params.config);

    // Defined shortcut references (link tokens without reference or resource)
    const links = filterByTypes(tokens, ['link']);
    for (const link of links) {
      if (getDescendantsByType(link, ['reference']).length > 0) continue;
      if (getDescendantsByType(link, ['resource']).length > 0) continue;

      const labelTextToken = getDescendantsByType(link, [
        'label',
        'labelText',
      ])[0];
      if (!labelTextToken) continue;

      reportShortcut(onError, params, labelTextToken.text, link, ignoreRe);
    }

    // Undefined shortcut references (when check_undefined is enabled)
    const checkUndefined =
      params.config.check_undefined === undefined ||
      !!params.config.check_undefined;
    if (!checkUndefined) return;

    const undefinedShortcuts = filterByTypes(tokens, [
      'undefinedReferenceShortcut',
    ]);
    for (const token of undefinedShortcuts) {
      const undefinedRef = getDescendantsByType(token, [
        'undefinedReference',
      ])[0];
      if (!undefinedRef) continue;

      const labelText = undefinedRef.children.map((t) => t.text).join('');
      reportShortcut(onError, params, labelText, token, ignoreRe);
    }
  },
};
