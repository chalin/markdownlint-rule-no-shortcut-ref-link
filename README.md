# markdownlint-rule-no-shortcut-ref-link

> A [markdownlint][] companion rule to [MD052][] that flags [shortcut reference
> links][shortcut-ref] and can auto-convert them to [collapsed][] form.

Markdown supports three forms of [reference links][]:

| Form      | Syntax          | Example             |
| --------- | --------------- | ------------------- |
| Full      | `[text][label]` | `[about us][about]` |
| Collapsed | `[label][]`     | `[example][]`       |
| Shortcut  | `[label]`       | `[example]`         |

## Why this rule?

An **undefined reference** is a reference link with no matching definition.
[MD052][] reports undefined references, but it **ignores shortcut syntax** by
default because bracketed text can be ambiguous.

To catch undefined shortcut references, you can either:

- _Configure MD052_ to report undefined shortcut references. Note that this can
  be hard to tune for your content.
- _Use this companion rule_ to auto-convert shortcut refs to the unambiguous
  collapsed form (`[label][]`), then let MD052 catch missing definitions.

For details, including sample MD052 configuration, see
[MD052 vs this rule](#md052-vs-this-rule).

## Scope

- A defined shortcut is `[label]` with a matching link definition in the same
  document.

- **Defined shortcuts** are flagged for both single- and multi-word labels (for
  example, `[Custom Rules]`).

- **Undefined shortcuts** are flagged by default. Set
  [`check_undefined`](#check_undefined) to `false` to only flag refs with a
  matching definition.

## Install

From GitHub:

```sh
npm install github:chalin/markdownlint-rule-no-shortcut-ref-link#semver:0.3.0 --save-dev
```

## Usage

### 1. Register with markdownlint-cli2

In `.markdownlint-cli2.yaml`:

```yaml
customRules:
  - markdownlint-rule-no-shortcut-ref-link
```

### 2. Enable in config

In `.markdownlint.yaml`:

```yaml
no-shortcut-ref-link: true
```

### 3. Configure (optional)

| Option            | Type    | Default | Description                                                     |
| ----------------- | ------- | ------- | --------------------------------------------------------------- |
| `check_undefined` | boolean | `true`  | When `true`, flag undefined shortcut refs; when `false`, don't. |
| `ignore_pattern`  | string  | (none)  | Regex; labels matching this pattern are skipped                 |

#### `check_undefined`

To only flag shortcut refs that have a definition (and ignore undefined ones),
set `check_undefined: false`:

```yaml
no-shortcut-ref-link:
  check_undefined: false
```

#### `ignore_pattern`

Use `ignore_pattern` to skip labels that match a regular expression. For
example, to ignore footnote-style numeric references like `[1]`:

```yaml
no-shortcut-ref-link:
  ignore_pattern: '^\d+$'
```

The following are always skipped regardless of configuration to avoid common
false positives:

- GitHub alert syntax: `[!NOTE]`, `[!WARNING]`, etc.
- Footnote references: `[^1]`, `[^note]`, etc.
- Labels embedded in identifiers: e.g. `otel.[name].enabled`, where both the
  character before `[` and after `]` are alphanumeric or `.`.
- Unresolved inline links: e.g. `[text]({{...}})`, where `]` is immediately
  followed by `(`. This covers template URLs that micromark cannot parse.
- Content inside raw-content HTML blocks (`<script>`, `<style>`, `<pre>`,
  `<textarea>`) so JS/CSS/textarea/pre bracket syntax is not touched. Shortcut
  refs inside other HTML blocks (e.g. `<div>`) are still flagged and fixed.

### 4. Fix violations (optional)

Run your linter with the `--fix` flag to auto-convert shortcut references:

```sh
npx markdownlint-cli2 --fix '**/*.md'
```

## MD052 vs this rule

Use **[MD052][]** (`reference-links-images`) when:

- You only need undefined-reference checks.
- `shortcut_syntax: true` with configured `ignored_labels` covers your needs.

Example config:

```yaml
reference-links-images:
  shortcut_syntax: true
  ignored_labels:
    # Ignore GitHub alert syntax
    - '!note'
    - '!warning'
    - ...
    # Ignore footnote-style numeric references
    - '1'
    - '2'
    - ...
```

Use **this rule** (`no-shortcut-ref-link`) as a companion when:

- You want to standardize on collapsed syntax (`[label][]`).
- You want auto-fix from shortcut to collapsed form.
- MD052 configuration alone is noisy or hard to tune for your content.

## Notice

Licensed under [Apache-2.0](LICENSE). Copyright 2026-present [@chalin][] and
contributors.

[@chalin]: https://github.com/chalin
[collapsed]: https://spec.commonmark.org/0.31.2/#collapsed-reference-link
[markdownlint]: https://github.com/DavidAnson/markdownlint
[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link
[shortcut-ref]: https://spec.commonmark.org/0.31.2/#shortcut-reference-link
