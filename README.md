# markdownlint-rule-no-shortcut-ref-link

> A [markdownlint][] rule that flags [shortcut reference links][] and offers an
> auto-fix to convert them to [collapsed][] form.

Markdown supports three forms of [reference links][]:

| Form      | Syntax           | Example            |
| --------- | ---------------- | ------------------ |
| Full      | `[text][label]`  | `[click here][ex]` |
| Collapsed | `[label][]`      | `[example][]`      |
| Shortcut  | `[label]`        | `[example]`        |

The **shortcut** form (`[label]`) is valid [CommonMark][] but is not
consistently recognized by all Markdown tools, including some [markdownlint][]
rules. This rule flags shortcut reference links and provides an auto-fix to
convert them to the unambiguous **collapsed** form (`[label][]`).

## Install

From GitHub:

```sh
npm install github:chalin/markdownlint-rule-no-shortcut-ref-link#semver:0.1.0 --save-dev
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

### 3. Fix violations

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
[shortcut reference links]:
  https://spec.commonmark.org/0.31.2/#shortcut-reference-link
