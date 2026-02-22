# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][]

## [v0.3.1][] - 2026-02-22

### Changed

- Shortcut-reference detection now covers all labels: defined refs are
  flagged/fixed, and undefined refs are flagged when `check_undefined` is true.

### Fixed

- Do not flag or modify content inside raw-content HTML blocks (`<script>`,
  `<style>`, `<pre>`, `<textarea>`). Undefined shortcut refs inside other HTML
  blocks (e.g. `<div>`) are still flagged and fixed.
- Do not flag or modify bracketed text inside inline HTML `<code>...</code>`
  tags.

## [v0.2.0][]

- `check_undefined`, `ignore_pattern` options; single-word shortcut refs only.

## [v0.1.0][]

- Initial release.

[Unreleased]: #
[v0.3.1]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link/compare/v0.3.0...v0.3.1
[v0.2.0]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link/compare/v0.1.0...v0.2.0
[v0.1.0]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link/releases/tag/v0.1.0
