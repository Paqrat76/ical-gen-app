---
id: index
title: iCalGenerator CLI Documentation
---

The `ical-gen-app` project provides a command-line interface (CLI) application (`iCalGenerator`) that consumes a JSON
file containing calendar event data and generates an iCalendar (`.ics`) file.

## Overview

The `iCalGenerator` CLI application is designed to generate iCalendar files (e.g., `myCalendar.ics`) conforming to
appropriate calendar componants defined in the [iCalendar Specification](https://www.rfc-editor.org/rfc/rfc5545).
This CLI application takes as input a path to a JSON source file containing event details.
The JSON source file was designed to be a simple, easy-to-read, and easy-to-write format for calendar event data.
It must adhere to the application-specific [JSON Schema](../src/schema/ical-gen-app-schema.json).

The intent is to generate calendars that can be imported into various calendar applications.
Example use cases include calendars containing events for:

- Family's birthdays and anniversaries that can be provided to all family members
- Sports team's practices and games that can be provided to all team members
- Curated set of specific holidays

These generated calendars DO NOT support scheduling or event management such as sending event requests, managing attendees,
or updating existing events.

## Description

The `iCalGenerator` CLI application is a simple tool that:

- Reads the provided JSON source file
- Validates the JSON against the application-specific JSON Schema (using [Ajv](https://ajv.js.org/))
- Generates an iCalendar object (using [ical-generator](https://www.npmjs.com/package/ical-generator))
- Writes the generated iCalendar object to a file in a predetermined output path

If desired, this generated iCalendar file can be validated using the [iCalendar Validator](https://icalendar.org/validator.html)
before importing it into a calendar application such as Google Calendar or Apple Calendar.

## `iCalGenerator` CLI Documentation

- [JSON Schema Documentation for iCalGenerator CLI](./schema-documentation.md)
- [User Guide for iCalGenerator CLI](./user-guide.md)

## References

- [iCalendar.org](https://icalendar.org)
  - [RRULE Tool](https://icalendar.org/rrule-tool.html) - tool to generate repeating rule strings
  - [iCalendar Validator](https://icalendar.org/validator.html) - tool to validate iCalendar data
  - [iCalendar (RFC 5545)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-5545/)
    - [iCalendar (RFC 7986)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-7986/)
- [Internet Calendaring and Scheduling Core Object Specification (iCalendar) - RFC-5545](https://www.rfc-editor.org/rfc/rfc5545)
  - [New Properties for iCalendar - RFC 7986](https://www.rfc-editor.org/rfc/rfc7986)
