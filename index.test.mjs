// @ts-check

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lint } from 'markdownlint/sync';
import { applyFixes } from 'markdownlint';
import rule from './index.mjs';

const ruleName = 'no-shortcut-ref-link';

function lintContent(content, ruleConfig = true) {
  const results = lint({
    strings: { content },
    config: { default: false, [ruleName]: ruleConfig },
    customRules: [rule],
  });
  return results.content;
}

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

    it('does not flag multi-word shortcut references', () => {
      const errors = lintContent(
        'See [Custom Rules] for details.\n\n[Custom Rules]: https://example.com\n',
      );
      assert.equal(errors.length, 0);
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

  describe('undefined shortcut references (check_undefined)', () => {
    it('flags undefined [word] by default', () => {
      const errors = lintContent('This [word] has no definition.\n');
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail, /\[word\]\[\]/);
    });

    it('does not flag undefined [word] when check_undefined is false', () => {
      const errors = lintContent('This [word] has no definition.\n', {
        check_undefined: false,
      });
      assert.equal(errors.length, 0);
    });

    it('does not flag multi-word undefined references', () => {
      const errors = lintContent('This [two words] has no definition.\n');
      assert.equal(errors.length, 0);
    });

    it('fixes undefined [word] to [word][]', () => {
      const input = 'See [foo] for details.\n';
      const fixed = fixContent(input);
      assert.equal(fixed, 'See [foo][] for details.\n');
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

    it('still flags defined shortcuts when check_undefined is false', () => {
      const errors = lintContent(
        'See [defined] and [undefined] here.\n\n[defined]: https://example.com\n',
        { check_undefined: false },
      );
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail, /\[defined\]/);
    });
  });

  describe('ignore_pattern', () => {
    it('skips labels matching ignore_pattern (defined ref)', () => {
      const errors = lintContent(
        'See [v1] and [foo] here.\n\n[v1]: https://example.com/v1\n[foo]: https://example.com/foo\n',
        { ignore_pattern: '^v\\d' },
      );
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail, /\[foo\]/);
    });

    it('skips labels matching ignore_pattern (undefined ref)', () => {
      const errors = lintContent('See [1] and [foo] here.\n', {
        ignore_pattern: '^\\d+$',
      });
      assert.equal(errors.length, 1);
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
});
