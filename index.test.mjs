// @ts-check

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lint } from 'markdownlint/sync';
import { applyFixes } from 'markdownlint';
import rule from './index.mjs';

const ruleName = 'no-shortcut-ref-link';

/** @param {boolean | string | Record<string, unknown>} [ruleConfig] */
function lintContent(content, ruleConfig = true) {
  const results = lint({
    strings: { content },
    config: { default: false, [ruleName]: ruleConfig },
    customRules: [rule],
  });
  return results.content;
}

/** @param {boolean | string | Record<string, unknown>} [ruleConfig] */
function fixContent(content, ruleConfig = true) {
  const errors = lintContent(content, ruleConfig);
  return applyFixes(content, errors);
}

describe(ruleName, () => {
  describe('defined shortcut references', () => {
    it('flags a single-word shortcut reference link', () => {
      const errors = lintContent(
        'See [markdownlint] for details.\n\n[markdownlint]: https://example.com\n',
      );
      assert.equal(errors.length, 1);
      assert.equal(errors[0].ruleNames[0], ruleName);
      assert.match(errors[0].ruleDescription, /collapsed form/);
    });

    it('does not flag collapsed reference links', () => {
      const errors = lintContent(
        'See [markdownlint][] for details.\n\n[markdownlint]: https://example.com\n',
      );
      assert.equal(errors.length, 0);
    });

    it('does not flag full reference links', () => {
      const errors = lintContent(
        'See [the tool][markdownlint] for details.\n\n[markdownlint]: https://example.com\n',
      );
      assert.equal(errors.length, 0);
    });

    it('does not flag inline links', () => {
      const errors = lintContent(
        'See [markdownlint](https://example.com) for details.\n',
      );
      assert.equal(errors.length, 0);
    });

    it('flags and fixes multi-word shortcut references', () => {
      const input =
        'See [Custom Rules] for details.\n\n[Custom Rules]: https://example.com\n';
      const errors = lintContent(input);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[Custom Rules\]/);
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        'See [Custom Rules][] for details.\n\n[Custom Rules]: https://example.com\n',
      );
    });

    it('flags multiple shortcut references on the same line', () => {
      const errors = lintContent(
        'Both [foo] and [bar] are tools.\n\n[foo]: https://example.com/foo\n[bar]: https://example.com/bar\n',
      );
      assert.equal(errors.length, 2);
    });

    it('fixes shortcut to collapsed form', () => {
      const input =
        'See [markdownlint] for details.\n\n[markdownlint]: https://example.com\n';
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        'See [markdownlint][] for details.\n\n[markdownlint]: https://example.com\n',
      );
    });

    it('fixes multiple shortcut references on one line', () => {
      const input =
        'Both [foo] and [bar] here.\n\n[foo]: https://example.com/foo\n[bar]: https://example.com/bar\n';
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        'Both [foo][] and [bar][] here.\n\n[foo]: https://example.com/foo\n[bar]: https://example.com/bar\n',
      );
    });

    it('does not modify already-collapsed references when fixing', () => {
      const input =
        'See [markdownlint][] for details.\n\n[markdownlint]: https://example.com\n';
      const fixed = fixContent(input);
      assert.equal(fixed, input);
    });

    it('flags hyphenated and dotted labels', () => {
      const errors = lintContent(
        'Use [my-tool] and [v2.0.0] here.\n\n[my-tool]: https://example.com\n[v2.0.0]: https://example.com/v2\n',
      );
      assert.equal(errors.length, 2);
    });

    it('fixes hyphenated and dotted labels', () => {
      const input =
        'Use [my-tool] and [v2.0.0] here.\n\n[my-tool]: https://example.com\n[v2.0.0]: https://example.com/v2\n';
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        'Use [my-tool][] and [v2.0.0][] here.\n\n[my-tool]: https://example.com\n[v2.0.0]: https://example.com/v2\n',
      );
    });

    it('provides correct range information', () => {
      const errors = lintContent(
        'Text [abc] end.\n\n[abc]: https://example.com\n',
      );
      assert.equal(errors.length, 1);
      assert.deepEqual(errors[0].errorRange, [6, 5]);
    });
  });

  describe('check_undefined: true (default)', () => {
    it('flags single-word undefined refs by default', () => {
      const errors = lintContent('This [word] has no definition.\n');
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[word\]\[\]/);
    });

    it('flags multi-word undefined refs by default', () => {
      const errors = lintContent('This [two words] has no definition.\n');
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[two words\]/);
    });

    it('fixes single-word undefined ref', () => {
      const input = 'See [foo] for details.\n';
      assert.equal(fixContent(input), 'See [foo][] for details.\n');
    });

    it('fixes multi-word undefined ref', () => {
      const input = 'This [two words] has no definition.\n';
      assert.equal(
        fixContent(input),
        'This [two words][] has no definition.\n',
      );
    });

    it('flags both defined and undefined shortcuts together', () => {
      const errors = lintContent(
        'See [defined] and [undefined] here.\n\n[defined]: https://example.com\n',
      );
      assert.equal(errors.length, 2);
    });

    it('does not flag GitHub alert syntax like [!NOTE]', () => {
      const errors = lintContent('> [!NOTE]\n>\n> Some note.\n');
      assert.equal(errors.length, 0);
    });

    it('does not flag footnote syntax like [^1]', () => {
      const errors = lintContent('Some text[^1] here.\n');
      assert.equal(errors.length, 0);
    });

    it('same behavior with explicit check_undefined: true', () => {
      const errors = lintContent('See [word] and [two words] here.\n', {
        check_undefined: true,
      });
      assert.equal(errors.length, 2);
    });
  });

  describe('check_undefined: false', () => {
    it('does not flag any undefined refs', () => {
      const errors = lintContent('See [word] and [two words] here.\n', {
        check_undefined: false,
      });
      assert.equal(errors.length, 0);
    });

    it('still flags defined shortcuts', () => {
      const errors = lintContent(
        'See [defined] and [undefined] here.\n\n[defined]: https://example.com\n',
        { check_undefined: false },
      );
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[defined\]/);
    });
  });

  describe('check_undefined validation', () => {
    it('throws when check_undefined is not a boolean', () => {
      for (const value of ['all', 'single', 'off', 1, null]) {
        assert.throws(
          () => lintContent('text\n', { check_undefined: value }),
          /check_undefined must be true or false/,
        );
      }
    });
  });

  describe('ignore_pattern', () => {
    it('skips labels matching ignore_pattern (defined ref)', () => {
      const errors = lintContent(
        'See [v1] and [foo] here.\n\n[v1]: https://example.com/v1\n[foo]: https://example.com/foo\n',
        { ignore_pattern: '^v\\d' },
      );
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[foo\]/);
    });

    it('skips labels matching ignore_pattern (undefined ref)', () => {
      const errors = lintContent('See [1] and [foo] here.\n', {
        ignore_pattern: '^\\d+$',
      });
      assert.equal(errors.length, 1);
      assert.ok(errors[0].errorDetail);
      assert.match(errors[0].errorDetail, /\[foo\]/);
    });

    it('flags everything when ignore_pattern is not set', () => {
      const errors = lintContent(
        'See [1] and [foo] here.\n\n[1]: https://example.com\n[foo]: https://example.com\n',
      );
      assert.equal(errors.length, 2);
    });

    it('does not interfere with check_undefined', () => {
      const errors = lintContent('See [1] and [foo] here.\n', {
        check_undefined: false,
        ignore_pattern: '^\\d+$',
      });
      assert.equal(errors.length, 0);
    });
  });

  describe('embedded in identifier', () => {
    it('skips [name] embedded in a dotted path', () => {
      const errors = lintContent('otel.instrumentation.[name].enabled\n');
      assert.equal(errors.length, 0);
    });

    it('flags _[foo]_ (markdown italic)', () => {
      const errors = lintContent(
        'Use _[foo]_ for details.\n\n[foo]: https://example.com\n',
      );
      assert.equal(errors.length, 1);
    });

    it('flags [name] with spaces around it', () => {
      const errors = lintContent('where [name] is the value\n');
      assert.equal(errors.length, 1);
    });

    it('flags **[foo]** (markdown formatting)', () => {
      const errors = lintContent(
        'Use **[foo]** for details.\n\n[foo]: https://example.com\n',
      );
      assert.equal(errors.length, 1);
    });

    it('flags [foo] at start of line', () => {
      const errors = lintContent(
        '[foo] is a tool.\n\n[foo]: https://example.com\n',
      );
      assert.equal(errors.length, 1);
    });

    it('flags [foo] at end of line', () => {
      const errors = lintContent('Use [foo]\n\n[foo]: https://example.com\n');
      assert.equal(errors.length, 1);
    });

    it('skips unresolved inline links with template URLs', () => {
      const errors = lintContent('See [issues]({{% param _issues %}}).\n');
      assert.equal(errors.length, 0);
    });
  });

  describe('HTML raw-content blocks', () => {
    it('does not flag or modify JS array syntax inside a script tag', () => {
      const input =
        '<script id="main-script">\n' +
        "        link.href = item['html_url'];\n" +
        '</script>\n' +
        '\n' +
        'Some [other-link] that gets fixed ...\n';
      const errors = lintContent(input);
      assert.equal(errors.length, 1);
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        '<script id="main-script">\n' +
          "        link.href = item['html_url'];\n" +
          '</script>\n' +
          '\n' +
          'Some [other-link][] that gets fixed ...\n',
      );
    });

    it('flags undefined shortcuts inside non-script HTML blocks', () => {
      const input =
        '<div>\n' + 'See [Custom Rules] for caveats.\n' + '</div>\n';
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        '<div>\n' + 'See [Custom Rules][] for caveats.\n' + '</div>\n',
      );
      const errors = lintContent(input);
      assert.equal(errors.length, 1);
    });

    it('does not flag or modify bracket syntax inside a pre tag', () => {
      const input =
        '<pre>\n' +
        "item['html_url']\n" +
        '</pre>\n' +
        '\n' +
        'Some [other-link] that gets fixed ...\n';
      const errors = lintContent(input);
      assert.equal(errors.length, 1);
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        '<pre>\n' +
          "item['html_url']\n" +
          '</pre>\n' +
          '\n' +
          'Some [other-link][] that gets fixed ...\n',
      );
    });

    it('does not flag or modify CSS content inside a style tag', () => {
      const input =
        '<style>\n' +
        ".x::before { content: '[inside]'; }\n" +
        '</style>\n' +
        '\n' +
        'Some [other-link] that gets fixed ...\n';
      const errors = lintContent(input);
      assert.equal(errors.length, 1);
      const fixed = fixContent(input);
      assert.equal(
        fixed,
        '<style>\n' +
          ".x::before { content: '[inside]'; }\n" +
          '</style>\n' +
          '\n' +
          'Some [other-link][] that gets fixed ...\n',
      );
    });
  });
});
