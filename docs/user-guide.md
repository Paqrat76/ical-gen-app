# User Guide for iCalGenerator CLI

`iCalGenerator` is a command-line interface (CLI) tool designed to generate iCalendar (`.ics`) files from JSON data files.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Input Data Schema](#input-data-schema)
- [Examples](#examples)
- [Debugging](#debugging)

---

## Installation

Assuming you have Node.js (version 24 or higher) installed, you can use the CLI directly if the package is installed:

```bash
# If installed globally
iCalGenerator [options]

# If using from the source with npm
npm run build
node dist/cli.js [options]
```

## Usage

The CLI's primary function is to convert a JSON source file into an `.ics` file.
The output file will be created in the same directory as the source file, with the same base name.

```bash
iCalGenerator -s <path-to-json-file>
```

## Options

- `-s, --sourceFile <path>` (Required): The local path to the source JSON file to be processed.
- `-d, --debug`: Output extra debugging information to the console.
- `-V, --version`: Output the version number of the application.
- `-h, --help`: Display help for the command.

## Input Data Schema

The source JSON file must conform to the iCalGen application schema. This ensures all events are correctly parsed
and formatted into the final `.ics` file.

See the [JSON Schema Documentation for iCalGenerator CLI](schema-documentation.md) for more information on the expected
JSON structure, including support for:

- All-Day Events
- Timed Events
- Recurrence Rules (RRULE)
- Categories and Locations
- Notifications

Each event in the JSON should include:

- Summary/Title (Required)
- Start/End Date/Time OR All-Day Start Date (Required)
- Optional Description, Categories, Location, Recurrence Rules, and Notifications

## Examples

### Basic Generation

Generate an iCalendar file from `events.json`:

```bash
iCalGenerator --sourceFile ./data/events.json
```

This will create `./data/events.ics`.

### Using Shortcuts

```bash
iCalGenerator -s ./test/samples/sample-ical-data.json
```

### With Debugging Enabled

```bash
iCalGenerator -s ./data/events.json -d
```

## Debugging

If you encounter issues during generation, use the `-d` or `--debug` flag.
This will provide more detailed output regarding the options being used and any potential issues encountered during processing.

---

## References

- [iCalendar.org](https://icalendar.org)
- [RFC-5545 Specification](https://www.rfc-editor.org/rfc/rfc5545)
