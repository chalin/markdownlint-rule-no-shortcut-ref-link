// @ts-check
// See README.md for behavior and configuration.

import {
  filterByTypes,
  getDescendantsByType,
} from 'markdownlint-rule-helpers/micromark';

// Some markdownlint-injected token types (e.g. undefinedReference*) are absent
// from micromark-util-types' TokenTypeMap. This helper casts a string to the
// TokenType expected by filterByTypes / getDescendantsByType.
/** @param {string} s @returns {import('micromark-util-types').TokenType} */
const tt = (s) => /** @type {any} */ (s);

// When the characters immediately before `[` and after `]` both match this
// pattern, the token is treated as embedded in an identifier (e.g.
// otel.[name].enabled) and skipped. Excludes _ and * since those are
// Markdown emphasis delimiters.
const identCharRe = /[a-zA-Z0-9.]/;

function buildIgnoreRe(config) {
  const pattern = config.ignore_pattern;
  if (!pattern) return null;
  return new RegExp(pattern);
}

function isEmbeddedInIdentifier(line, token) {
  const before = line[token.startColumn - 2]; // char before '['
  const after = line[token.endColumn - 1]; // char after ']'
  return before && after && identCharRe.test(before) && identCharRe.test(after);
}

function reportShortcut(onError, params, labelText, token, ignoreRe) {
  if (labelText.startsWith('!')) return; // GitHub alert syntax, e.g. [!NOTE]
  if (labelText.startsWith('^')) return; // footnote syntax, e.g. [^1]
  if (ignoreRe && ignoreRe.test(labelText)) return;
  if (token.startLine !== token.endLine) return;

  const line = params.lines[token.startLine - 1];
  if (isEmbeddedInIdentifier(line, token)) return;
  if (line[token.endColumn - 1] === '(') return; // unresolved inline link, e.g. [text]({{...}})

  onError({
    lineNumber: token.startLine,
    detail: `Use [${labelText}][] instead of [${labelText}]`,
    context: line.trim(),
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
    let checkUndefined = true;
    if (params.config.check_undefined !== undefined) {
      checkUndefined = params.config.check_undefined;
      if (typeof checkUndefined !== 'boolean') {
        throw new Error(
          `no-shortcut-ref-link: check_undefined must be true or false; got: ${JSON.stringify(checkUndefined)}`,
        );
      }
    }
    if (!checkUndefined) return;

    // Find htmlFlow ranges for raw-content blocks.
    const rawHtmlBlockStartRe = /<\s*(?:script|style|pre|textarea)\b/i;
    const htmlFlowRanges = filterByTypes(tokens, ['htmlFlow'])
      .filter((t) =>
        rawHtmlBlockStartRe.test(params.lines[t.startLine - 1] ?? ''),
      )
      .map((t) => [t.startLine, t.endLine]);

    const undefinedShortcuts = filterByTypes(tokens, [
      tt('undefinedReferenceShortcut'),
    ]);
    for (const token of undefinedShortcuts) {
      if (
        htmlFlowRanges.some(
          ([start, end]) => token.startLine >= start && token.endLine <= end,
        )
      ) {
        // Ignore undefined refs in raw-content blocks.
        continue;
      }

      const undefinedRef = getDescendantsByType(token, [
        tt('undefinedReference'),
      ])[0];
      if (!undefinedRef) continue;

      const labelText = undefinedRef.children.map((t) => t.text).join('');
      reportShortcut(onError, params, labelText, token, ignoreRe);
    }
  },
};
