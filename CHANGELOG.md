# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][]

### Added

- `check_undefined` is now a string enum: `all` (default), `single`, or
  `off`.
- Multi-word shortcut references that have a matching link definition are now
  flagged and fixed. Previously only single-word defined references were caught.

### Fixed

- Do not flag or modify JavaScript array syntax (e.g. `item['html_url']`) inside
  HTML blocks such as `<script>` tags. The rule now skips
  `undefinedReferenceShortcut` tokens that fall within `htmlFlow` ranges.

[Unreleased]: #
