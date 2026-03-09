# JSON Schema Documentation for iCalGenerator CLI

This document provides a detailed description of the JSON schema used by the `iCalGenerator` CLI application to parse
the source data JSON file used for generating iCalendar (`.ics`) files.

## iCalendar Specification References

- [iCalendar.org](https://icalendar.org)
- [RFC-5545 Specification](https://www.rfc-editor.org/rfc/rfc5545)

## Overview

The schema is located in the `iCalGenerator` CLI application project at `src/schema/ical-gen-app-schema.json`.
It defines a structured way to represent a calendar and its associated events for use only by this CLI application.
This schema defines the structure of the source JSON data file used to generate iCalendar files.
It does not map to specific iCalendar specification properties or components, nor does it support all iCalendar features.

## Root Object

The root of the JSON file must be an object with the following properties:

| Property      | Type     | Required | Description                                                 |
| :------------ | :------- | :------: | :---------------------------------------------------------- |
| `name`        | `string` | **Yes**  | The name of the calendar.                                   |
| `description` | `string` |    No    | A brief description of the calendar.                        |
| `events`      | `array`  | **Yes**  | An array of event objects. Must contain at least one event. |

## Event Object

Each event in the `events` array can be either an **All-Day Event** or a **Timed Event**.
**All-Day Events** and **Timed Events** are mutually exclusive. Both types share common properties.

### All-Day Event

An event is considered an all-day event if it includes the `allDayStart` property.

| Property      | Type     | Format | Required | Description                                         |
| :------------ | :------- | :----- | :------: | :-------------------------------------------------- |
| `allDayStart` | `string` | `date` | **Yes**  | The start date of the event in `YYYY-MM-DD` format. |

### Timed Event

An event is considered a timed event if it includes both `start` and `end` properties.

| Property | Type     | Format      | Required | Description                                                                                  |
| :------- | :------- | :---------- | :------: | :------------------------------------------------------------------------------------------- |
| `start`  | `string` | `date-time` | **Yes**  | The start date and time of the event in ISO 8601 format (e.g., `2026-03-15T18:00:00-04:00`). |
| `end`    | `string` | `date-time` | **Yes**  | The end date and time of the event in ISO 8601 format.                                       |

> **NOTE**
>
> The `start` and `end` date-time properties:
>
> - SHOULD specify an appropriate timezone offset (i.e., `Z` for UTC or `±hh:mm` for local time zone).
>   If no timezone offset is provided, the resulting iCalendar date-time could be indeterminant, which may cause issues
>   with calendar applications.
> - SHOULD use seconds precision (e.g., `2026-03-15T18:00:00-04:00`). If milliseconds precision is used, the resulting
>   time will have the milliseconds truncated.

### Common Properties

| Property         | Type       | Required | Description                                                                                                        |
| :--------------- | :--------- | :------: | :----------------------------------------------------------------------------------------------------------------- |
| `summary`        | `string`   | **Yes**  | A short summary or title for the event.                                                                            |
| `description`    | `string`   |    No    | A more detailed description of the event.                                                                          |
| `categories`     | `string[]` |    No    | An array of strings representing the categories for the event. Used by calendar applications to search for events. |
| `location`       | `string`   |    No    | The location where the event takes place.                                                                          |
| `notifications`  | `array`    |    No    | A list of event notifications to trigger before the event starts. Must contain at least one item if provided.      |
| `recurrenceRule` | `string`   |    No    | An iCalendar Recurrence Rule (e.g., `RRULE:FREQ=YEARLY;...`). Must match the pattern `^RRULE:.+$`.                 |

> **NOTE**
>
> The `recurrenceRule` property value must have `RRULE:` prepended to the actual recurrence rule. No other rule
> validation is attempted. The actual recurrence rule value can be easily generated using the [iCalendar Recurrence Rule Generator](https://icalendar.org/rrule-tool.html).
>
> **IMPORTANT**
>
> Be aware that not all possible recurrence rules are supported by all calendar applications.

### Notification Object

Each item in the `notifications` array must be an object with the following properties:

| Property  | Type       | Required | Description                                                                         |
| :-------- | :--------- | :------: | :---------------------------------------------------------------------------------- |
| `trigger` | `integer`  | **Yes**  | How many units before the event the notification should fire. Must be at least `1`. |
| `unit`    | `string`   | **Yes**  | The time unit for the trigger. Allowed values: `minute`, `hour`, `day`, `week`.     |
| `emails`  | `string[]` |    No    | An array of strings representing the email addresses for the notification.          |

Notifications are interpreted as reminders that occur **before** the event start time. Only "DISPLAY" and "EMAIL" alarm
types defined by the iCalendar specification are supported.
If the `emails` property is provided, the event notification will be sent to those emails. Otherwise, the notification
will be sent based on how the calendar application handles notifications.

## Examples

### Minimum Calendar Example

The following is a sample calendar object with the minimum required properties.

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

The following is a sample calendar object with all supported event types.

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
