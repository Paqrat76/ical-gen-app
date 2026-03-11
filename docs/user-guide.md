---
id: usage-doc
title: User Guide
---

# User Guide

[**Home**](https://paqrat76.github.io/ical-gen-app/index.html)

`iCalGenerator` is a command-line interface (CLI) tool designed to generate iCalendar (`.ics`) files from JSON data files.

The generated calendars are intended to provide calendars containing specific all day and/or timed events for import
into calendar applications. Example use cases include calendars containing events for:

- Family's birthdays and anniversaries that can be provided to all family members
- Sports team's practices and games that can be provided to all team members
- Curated set of specific holidays

These calendars DO NOT support scheduling or event management such as sending event requests, managing attendees,
or updating existing events.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Input Data Schema](#input-data-schema)
- [Examples](#examples)
- [Debugging](#debugging)
- [References](#references)

---

## Prerequisites

This CLI tool requires Node.js to be installed on your system. The currently supported LTS version is v22 or higher.

Installing Node.js:

- [Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [How to Install Node.js: A Step-by-Step Guide](https://dev.to/surendra_sahu_dbf30c18278/how-to-install-nodejs-a-step-by-step-guide-3ckf)
- [How to install Node.js and npm on Windows, macOS, and Linux](https://kinsta.com/blog/how-to-install-node-js/)

## Installation

Assuming you have Node.js (version 22 or higher) installed, you can install the CLI tool globally using npm:

```bash
npm install -g @paqrat76/ical-gen-app
```

You can then use the CLI directly:

```bash
# If installed globally, execute the CLI help option
iCalGenerator --help

  _           _  ____                           _
 (_) ___ __ _| |/ ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __
 | |/ __/ _` | | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
 | | (_| (_| | | |_| |  __/ | | |  __/ | | (_| | || (_) | |
 |_|\___\__,_|_|\____|\___|_| |_|\___|_|  \__,_|\__\___/|_|

ical-gen-app@1.0.0

Usage: icalGenerator [options]

Generates the ".ics" file in the same directory as the JSON data file with the
same basename. The JSON data file must conform to the iCalendar schema.

Options:
  -V, --version                  output the version number
  -s, --sourceFile <sourceFile>  (REQUIRED) local path to the source JSON file
                                 to be processed
  -d, --debug                    output extra debugging info
  -h, --help                     display help for command

User Guide: https://paqrat76.github.io/ical-gen-app/docs/user-guide.html
JSON Schema Documentation: https://paqrat76.github.io/ical-gen-app/docs/schema-documentation.html
```

## Usage

The CLI's primary function is to convert a JSON source file into an `.ics` file.
The output file will be created in the same directory as the source file, with the same base name, and with the `.ics`
extension.
The `<path-to-json-file>` may be an absolute path or a relative path from the current working directory from where the
CLI is executed.

```bash
iCalGenerator -s <path-to-json-file>

  _           _  ____                           _
 (_) ___ __ _| |/ ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __
 | |/ __/ _` | | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
 | | (_| (_| | | |_| |  __/ | | |  __/ | | (_| | || (_) | |
 |_|\___\__,_|_|\____|\___|_| |_|\___|_|  \__,_|\__\___/|_|

Executed with user options {"sourceFile":"<path-to-json-file>","debug":false}

***** Beginning iCalendar generation for '<path-to-json-file>'...

***** Successfully generated the iCalendar file at <absolute-path-to-ics-file>

```

## Options

- `-s, --sourceFile <path>` (Required): The local path (absolute or relative) to the source JSON file to be processed.
- `-d, --debug`: Output extra debugging information to the console.
- `-V, --version`: Output the version number of the application.
- `-h, --help`: Display help for the command.

## Input Data Schema

The source JSON file must conform to the `ical-gen-app` project schema. This ensures all events are correctly parsed
and formatted into the final `.ics` file.

See the [JSON Schema Documentation](schema-documentation.md) for more information on the expected
JSON structure, including support for:

- All-Day Events
- Timed Events
- Recurrence Rules (RRULE)
- Categories and Locations
- Notifications

Each event in the JSON should include:

- Summary/Title (Required)
- Start/End DateTimes OR All-Day Start Date (Required)
- Optional Description, Categories, Location, Recurrence Rule, and Notifications

## Examples

### Basic Generation

Generate an iCalendar file from `~/ical/data/events.json`:

```bash
iCalGenerator --sourceFile ~/ical/data/events.json
```

This will create `~/ical/data/events.ics`.

### Using Shortcuts

```bash
iCalGenerator -s ~/ical/data/events.json
```

### With Debugging Enabled

```bash
iCalGenerator -s ~/ical/data/events.json -d
```

## Debugging

If you encounter issues during generation, use the `-d` or `--debug` flag.
This will provide more detailed output regarding the options being used and any potential issues encountered during processing.

## References

- [iCalendar.org](https://icalendar.org)
  - [RRULE Tool](https://icalendar.org/rrule-tool.html) - tool to generate repeating rule strings
  - [iCalendar Validator](https://icalendar.org/validator.html) - tool to validate iCalendar data
  - [iCalendar (RFC 5545)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-5545/)
    - [iCalendar (RFC 7986)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-7986/)
- [Internet Calendaring and Scheduling Core Object Specification (iCalendar) - RFC-5545](https://www.rfc-editor.org/rfc/rfc5545)
  - [New Properties for iCalendar - RFC 7986](https://www.rfc-editor.org/rfc/rfc7986)

[**Home**](https://paqrat76.github.io/ical-gen-app/index.html)
