---
id: schema-doc
title: JSON Schema Documentation for iCalGenerator CLI
---

This document provides a detailed description of the JSON schema used by the `iCalGenerator` CLI application to parse
the source data JSON file used for generating iCalendar (`.ics`) files.

## iCalendar Specification References

- [iCalendar.org](https://icalendar.org)
- [Internet Calendaring and Scheduling Core Object Specification (iCalendar) - RFC-5545](https://www.rfc-editor.org/rfc/rfc5545)
  - [New Properties for iCalendar - RFC 7986](https://www.rfc-editor.org/rfc/rfc7986)

## Overview

The schema is located in the [`ical-gen-app`](https://github.com/Paqrat76/ical-gen-app/tree/main) CLI application project
at [`src/schema/ical-gen-app-schema.json`](https://github.com/Paqrat76/ical-gen-app/blob/main/src/schema/ical-gen-app-schema.json).
It defines a structured way to represent a calendar and its associated events for use only by this CLI application.
This schema defines the structure of the source JSON data file used to generate iCalendar files.
It does not directly map to specific iCalendar specification properties or components, nor does it support all iCalendar
features.
That said, links to the iCalendar specification are provided for reference where appropriate.

Additionally, this schema does not include selected iCalendar properties that are required according to the specification.
These required properties are populated with appropriate default values.

## Root iCalendar Object

The root of the JSON file must be an object with the following properties:

| Property      | Type     | Required | Description (Specification Link)                                                                                            |
| :------------ | :------- | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string` | **Yes**  | The name of the calendar ([NAME](https://www.rfc-editor.org/rfc/rfc7986#page-5))                                            |
| `description` | `string` |    No    | A brief description of the calendar ([DESCRIPTION](https://www.rfc-editor.org/rfc/rfc7986#section-5.2))                     |
| `events`      | `array`  | **Yes**  | An array of event objects. Must contain at least one event ([VEVENT](https://www.rfc-editor.org/rfc/rfc5545#section-3.6.1)) |

## Event Object

Each event in the `events` array can be either an **All-Day Event** or a **Timed Event**.
**All-Day Events** and **Timed Events** are mutually exclusive. Both types share common properties.

### All-Day Event

An event is considered an all-day event if it includes the `allDayStart` property.

| Property      | Type     | Format | Required | Description (Specification Link)                                                                                       |
| :------------ | :------- | :----- | :------: | :--------------------------------------------------------------------------------------------------------------------- |
| `allDayStart` | `string` | `date` | **Yes**  | The start date of the event in `YYYY-MM-DD` format ([DTSTART](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.2.4)) |

### Timed Event

An event is considered a timed event if it includes both `start` and `end` properties.

| Property | Type     | Format      | Required | Description (Specification Link)                                                                                                                                |
| :------- | :------- | :---------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`  | `string` | `date-time` | **Yes**  | The start date and time of the event in ISO 8601 format (e.g., `2026-03-15T18:00:00-04:00`) ([DTSTART](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.2.4)) |
| `end`    | `string` | `date-time` | **Yes**  | The end date and time of the event in ISO 8601 format ([DTEND](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.2.2))                                         |

> **NOTE**
>
> The `start` and `end` date-time properties SHOULD:
>
> - Specify an appropriate timezone offset (i.e., `Z` for UTC or `±hh:mm` for local time zone).
>   If no timezone offset is provided, the resulting iCalendar date-time could be indeterminant, which may cause issues
>   with calendar applications.
> - Use seconds precision (e.g., `2026-03-15T18:00:00-04:00`). If milliseconds precision is used, the resulting
>   time will have the milliseconds truncated.

### Common Properties

The following properties are common to both **All-Day Events** and **Timed Events**.

| Property         | Type       | Required | Description (Specification Link)                                                                                                                                                         |
| :--------------- | :--------- | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `summary`        | `string`   | **Yes**  | A short summary or title for the event ([SUMMARY](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.1.12))                                                                              |
| `description`    | `string`   |    No    | A more detailed description of the event ([DESCRIPTION](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.1.5))                                                                         |
| `categories`     | `string[]` |    No    | An array of strings representing the categories for the event; Used by calendar applications to search for events ([CATEGORIES](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.1.2)) |
| `location`       | `string`   |    No    | The location where the event takes place ([LOCATION](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.1.7))                                                                            |
| `notifications`  | `array`    |    No    | A list of event notifications to trigger before the event starts; Must contain at least one item if provided ([VALARM](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.6))            |
| `recurrenceRule` | `string`   |    No    | An iCalendar Recurrence Rule (e.g., `RRULE:FREQ=YEARLY;...`); Must match the pattern `^RRULE:.+$` ([RRULE](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.5.3))                      |

> **NOTES**
>
> The `recurrenceRule` property value must have `RRULE:` prepended to the actual recurrence rule. No other rule
> validation is attempted. The actual recurrence rule value can be easily generated using the [iCalendar Recurrence Rule Generator](https://icalendar.org/rrule-tool.html).
>
> **IMPORTANT**
>
> Be aware that not all possible recurrence rules are supported by all calendar applications.

### Notification Object

Each item in the `notifications` array must be an object with the following properties:

| Property  | Type       | Required | Description                                                                        |
| :-------- | :--------- | :------: | :--------------------------------------------------------------------------------- |
| `trigger` | `integer`  | **Yes**  | How many units before the event the notification should fire; Must be at least `1` |
| `unit`    | `string`   | **Yes**  | The time unit for the trigger; Allowed values: `minute`, `hour`, `day`, `week`     |
| `emails`  | `string[]` |    No    | An array of strings representing the email addresses for the notification          |

Notifications are interpreted as reminders that occur **before** the event start time. This implementation is loosely based
on the [VALARM](https://www.rfc-editor.org/rfc/rfc5545#section-3.6.6) specification. Only `DISPLAY` and `EMAIL` alarm
actions defined by [ACTION](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.6.1) are supported.
If the `emails` property is provided, the event notification will be sent to those email addressess by the calendar
application. Otherwise, the notification will be sent based on how the calendar application handles notifications.

## Examples

### Minimum Calendar Example

The following is a sample JSON object with the minimum required iCalendar properties.

```json
{
  "name": "Minimum Sample Calendar",
  "events": [
    {
      "summary": "All Day Event",
      "allDayStart": "2026-11-11"
    },
    {
      "summary": "Recurring All Day Event",
      "allDayStart": "2026-07-04",
      "recurrenceRule": "RRULE:FREQ=YEARLY;COUNT=10"
    },
    {
      "summary": "Timed Event",
      "start": "2026-03-15T18:00:00-04:00",
      "end": "2026-03-15T20:00:00-04:00"
    },
    {
      "summary": "Recurring Timed Event",
      "start": "2026-03-15T10:00:00-04:00",
      "end": "2026-03-15T11:00:00-04:00",
      "recurrenceRule": "RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=1;UNTIL=20270101T000000Z"
    }
  ]
}
```

### Full Calendar Example

The following is a sample JSON object with all supported iCalendar properties.

```json
{
  "name": "Full Sample Calendar",
  "description": "Sample Calendar Description using all supported event properties",
  "events": [
    {
      "summary": "All Day Event",
      "description": "Sample one time all day event",
      "allDayStart": "2026-11-11",
      "categories": ["Category1"],
      "location": "Sample Location, 123 Main St, Anytown, USA",
      "notifications": [
        { "trigger": 15, "unit": "minute" },
        { "trigger": 1, "unit": "day", "emails": ["email1@example.com"] }
      ]
    },
    {
      "summary": "Recurring All Day Event",
      "description": "Sample recurring all day event; Use 'RRULE' value from https://icalendar.org/rrule-tool.html",
      "allDayStart": "2026-07-04",
      "categories": ["Category1", "Category2"],
      "recurrenceRule": "RRULE:FREQ=YEARLY;INTERVAL=1;BYMONTH=7;BYMONTHDAY=4;COUNT=10"
    },
    {
      "summary": "Timed Event",
      "description": "Sample one time timed event",
      "start": "2026-03-15T18:00:00-04:00",
      "end": "2026-03-15T20:00:00-04:00",
      "categories": ["Category3"],
      "location": "Headquarters, Main Conference Room"
    },
    {
      "summary": "Recurring Timed Event",
      "description": "Sample recurring timed event; Use 'RRULE' value from https://icalendar.org/rrule-tool.html",
      "start": "2026-03-15T10:00:00-04:00",
      "end": "2026-03-15T11:00:00-04:00",
      "categories": ["Category4", "Category5"],
      "location": "Engineering Building, Room 101",
      "recurrenceRule": "RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=1;UNTIL=20270101T000000Z",
      "notifications": [
        { "trigger": 10, "unit": "minute" },
        { "trigger": 1, "unit": "hour" }
      ]
    }
  ]
}
```
