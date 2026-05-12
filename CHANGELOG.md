# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-07

### Added

- Initial release. Native Google `urlContext` policy extension for the pi coding agent. Injects `{ urlContext: {} }` into `google-generative-ai` and `google-vertex` requests unless `PI_GOOGLE_URL_CONTEXT` is explicitly disabled (`0`/`false`/`no`/`off`).
