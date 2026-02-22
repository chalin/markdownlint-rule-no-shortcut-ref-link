# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][]

### Changed

- Undefined shortcut checking now flags all undefined shortcut refs when enabled
  (not just single-word refs).

### Added

- Multi-word shortcut references that have a matching link definition are now
  flagged and fixed (regardless of `check_undefined`). Previously only
  single-word defined references were caught.

### Fixed

- Do not flag or modify content inside raw-content HTML blocks (`<script>`,
  `<style>`, `<pre>`, `<textarea>`). Undefined shortcut refs inside other HTML
  blocks (e.g. `<div>`) are still flagged and fixed.

## [v0.2.0][]

- `check_undefined`, `ignore_pattern` options; single-word shortcut refs only.

## [v0.1.0][]

- Initial release.

[Unreleased]: #
[v0.2.0]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link/compare/v0.1.0...v0.2.0
[v0.1.0]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link/releases/tag/v0.1.0
