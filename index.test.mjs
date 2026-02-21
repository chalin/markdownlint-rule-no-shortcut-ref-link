// @ts-check

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lint } from 'markdownlint/sync';
import { applyFixes } from 'markdownlint';
import rule from './index.mjs';

const ruleName = 'no-shortcut-ref-link';

function lintContent(content) {
  const results = lint({
    strings: { content },
    config: { default: false, [ruleName]: true },
    customRules: [rule],
  });
  return results.content;
}

function fixContent(content) {
  const errors = lintContent(content);
  return applyFixes(content, errors);
}

describe(ruleName, () => {
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

  it('does not flag undefined references (just bracketed text)', () => {
    const errors = lintContent('This [word] has no definition.\n');
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
