# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [0.4.0] - 2026-02-27

### Added

- Application name/version to error and debug messages
- `docs` folder for project documentation

### Changed

- Updated `cli.ts` to simplify code and prevent unexpected errors
- Updated README.md

### Removed

- Luxon dependency / Replaced use of Luxon DateTime for DTSTAMP value with native JavaScript Date

### Fixed

- Missing JSON schema for `iCalGenerator` in the `dist` folder

### Security

- Updated security "overrides"
  - minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments (patch in 10.2.3)
    [CVE-2026-27903](https://github.com/advisories/GHSA-7r86-cg39-jmmj)
  - minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions (patch in 10.2.3)
    [CVE-2026-27904](https://github.com/advisories/GHSA-23c5-xmqv-rm74)


## [0.3.0] - 2026-02-26

### Added

- bin for `iCalGenerator`
- Generated JSON schema for iCalendar data JSON file
- All source code and minimal tests

### Changed

- Updated dependencies
- Updated ical-data-specification.md
- Updated JSON schema generator script

### Security

- Applied security "overrides"
  - minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern (patch in 10.2.2)
    [CVE-2026-26996](https://github.com/advisories/GHSA-3ppc-4f35-3m26)
  - ajv has ReDoS when using `$data` option
    [CVE-2025-69873](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) (patch in 8.18.0)


## [0.2.0] - 2026-02-11

### Added

- ical-data-specification.md
- Experimental tests
- Tool to create the ical-gen-app-schema.json

### Changed

- Updated README.md


## [0.1.0] - 2026-02-09

### Added

- Fully initialized project based on Paqrat76/typescript-template
