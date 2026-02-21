# markdownlint-rule-no-shortcut-ref-link

> A [markdownlint][] rule that flags [shortcut reference links][] and offers an
> auto-fix to convert them to [collapsed][] form.

Markdown supports three forms of [reference links][]:

| Form      | Syntax          | Example            |
| --------- | --------------- | ------------------ |
| Full      | `[text][label]` | `[click here][ex]` |
| Collapsed | `[label][]`     | `[example][]`      |
| Shortcut  | `[label]`       | `[example]`        |

The **shortcut** form (`[label]`) is valid [CommonMark][] but is not
consistently recognized by all Markdown tools, including some [markdownlint][]
rules. This rule flags shortcut reference links and provides an auto-fix to
convert them to the unambiguous **collapsed** form (`[label][]`).

## Why avoid shortcut references?

The built-in markdownlint rule [MD052][] (`reference-links-images`) flags
reference links whose label has no matching definition. However, by default it
only checks collapsed (`[label][]`) and full (`[text][label]`) forms. Shortcut
references (`[label]`) are silently ignored.

This means that if you write `[example]` and forget the definition, no linter
warning is produced -- the text simply renders as literal `[example]` instead of
a link. With the collapsed form `[example][]`, MD052 catches the missing
definition immediately.

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

## Install

From GitHub:

```sh
npm install github:chalin/markdownlint-rule-no-shortcut-ref-link#semver:0.2.0 --save-dev
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

| Option            | Type    | Default | Description                                       |
| ----------------- | ------- | ------- | ------------------------------------------------- |
| `check_undefined` | boolean | `true`  | Also flag `[word]` when no link definition exists |
| `ignore_pattern`  | string  | (none)  | Regex; labels matching this pattern are skipped   |

By default, the rule flags all single-word shortcut references, whether or not a
matching link definition exists. Set `check_undefined: false` to only flag
shortcuts that have a definition:

```yaml
no-shortcut-ref-link:
  check_undefined: false
```

Use `ignore_pattern` to skip labels that match a regular expression. For
example, to ignore footnote-style numeric references like `[1]`:

```yaml
no-shortcut-ref-link:
  ignore_pattern: '^\d+$'
```

The following are always skipped regardless of configuration:

- GitHub alert syntax: `[!NOTE]`, `[!WARNING]`, etc.
- Footnote references: `[^1]`, `[^note]`, etc.
- Labels embedded in identifiers: e.g. `otel.[name].enabled`, where both the
  character before `[` and after `]` are alphanumeric or `.`.
- Unresolved inline links: e.g. `[text]({{...}})`, where `]` is immediately
  followed by `(`. This covers template URLs that micromark cannot parse.

### 4. Fix violations

Run your linter with the `--fix` flag to auto-convert shortcut references:

```sh
npx markdownlint-cli2 --fix '**/*.md'
```

## Scope

The rule currently flags **single-word** shortcut reference links (labels with
no whitespace). Multi-word shortcut references may be supported in a future
version.

## License

[Apache-2.0](LICENSE)

[collapsed]: https://spec.commonmark.org/0.31.2/#collapsed-reference-link
[CommonMark]: https://spec.commonmark.org/
[markdownlint]: https://github.com/DavidAnson/markdownlint
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link
[shortcut reference links]: https://spec.commonmark.org/0.31.2/#shortcut-reference-link
