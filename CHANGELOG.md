# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-09-24

### Changed

- Migrate from `@mariozechner/pi-*` to `@earendil-works/pi-*` peer and dev dependencies.
- Refresh devDependencies to latest: @biomejs/biome 2.5.14, vitest 5.0.1, typescript 7.0.2, @types/node 26.6.2, @typescript/native-preview 7.0.0-dev.20260707.2.
- Add CI workflow with Bun 1.4.2 for Node 22 and 24 on ubuntu-latest and macos-latest.
- Update engines.node to >=22.19.0.

## [0.1.0] - 2026-05-07

### Added

- Initial release. Native Google `urlContext` policy extension for the pi coding agent. Injects `{ urlContext: {} }` into `google-generative-ai` and `google-vertex` requests unless `PI_GOOGLE_URL_CONTEXT` is explicitly disabled (`0`/`false`/`no`/`off`).
