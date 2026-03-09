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

## [0.7.0] - 2026-03-09

### Added

- README.md overview content describing project purpose, usage scenarios, and documentation links
- User guide sections for prerequisites, global npm installation, and expanded CLI usage examples
- Additional documentation references for iCalendar validation and RRULE authoring tools

### Changed

- CLI option logging now outputs only user-provided options instead of internal application options
- Downgraded the minimum Node.js version to 22.x for wider user invironments
- Documentation updated to clarify supported Node.js version, installation flow, output behavior, and source file path handling
- Updated dependencies


## [0.6.0] - 2026-03-07

### Added

- Support for event notifications/alarms in the iCalendar data model
- Documentation links in CLI help output for the user guide and JSON schema documentation

### Changed

- Updated event schema/types to use `notifications` for event reminders
- Updated README.md dependency notes to include alarm support in `ical-generator`
- Updated development dependencies

### Removed

- `recurrenceDates` and `exceptionDates` from the base event schema/types
- Obsolete generated sample file `test/samples/sample-ical-data.ics`

### Fixed

- Replaced placeholder CLI help text with actual project documentation references


## [0.5.0] - 2026-03-06

### Added

- `util.ts`: `function verifyJsonFilePath()` for a more rigorous JSON file path validation
- `util.ts`: `function describeUnknownError()` for a more rigorous error handling

### Changed

- Updated development dependencies
- Updated Jest configuration
- Updated unit tests to achieve desired coverage
- `util.ts`: Refactored utility functions based on selected AI suggestions
- `app.ts`: Refactored `ICalGeneratorApp` using the new and refactored utility functions

### Removed

- package.json `overrides` section to resolve Jest coverage issue while maintaining security


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
