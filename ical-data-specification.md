# ICAL Data Specification

This specification defines the source data format for an ICAL calendar defined in a JSON file.
This specification was designed to support the data requirements of the [sebbo2002/ical-generator](https://www.npmjs.com/package/ical-generator) library.
Calendars to be generated are intended to represent fixed and/or recurring events such as holidays or family dates
(e.g., birthdays, anniversaries, etc.) that represent "all day" events.
Calendar events having a start and end time are called "timed events" and are also supported.
These events do not require invitations and other complex features.
Therefore, this generator only supports the most basic features of the iCalendar standard.

## iCalendar Specifications

- [RFC-5545](https://www.rfc-editor.org/rfc/rfc5545)
  - [RFC 7986](https://www.rfc-editor.org/rfc/rfc7986)
- [iCalendar (RFC 5545)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-5545/)
  - [iCalendar (RFC 7986)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-7986/)

### Property Datatypes

- [TEXT](https://icalendar.org/iCalendar-RFC-5545/3-3-11-text.html): Use '\n' for line feeds within property values
  - Content lines longer than 75 characters SHOULD be folded
- [DATE](https://icalendar.org/iCalendar-RFC-5545/3-3-4-date.html): ISO 8601 formatted date string (e.g., `19970714`)
- [DATE-TIME](https://icalendar.org/iCalendar-RFC-5545/3-3-5-date-time.html): ISO 8601 formatted date-time string
  (e.g., local: `19980118T230000` or UTC: `19980119T070000Z`)
- **NOTE:** The iCalendar object is organized into individual lines of text, called content lines. Content lines are
  delimited by a line break, which is a CRLF sequence (CR character followed by LF character. i.e., `\r\n`).
  - "Folding" is the process of breaking up long lines into multiple lines, each of which is no longer than 75 characters.
    That is, a long line can be split between any two characters by inserting a CRLF immediately followed by a single
    linear white-space character (i.e., SPACE or HTAB). Any sequence of CRLF followed immediately by a single linear
    white-space character is ignored (i.e., removed) when processing the content type.
  - "Unfolding" is the process of reassembling a folded line back into a single line. Unfolding is achieved by
    removing the CRLF and the linear white-space character that immediately follows. When parsing a content line, folded
    lines MUST first be unfolded according to the unfolding procedure described above.

### Calendar Properties (`VCALENDAR`)

- Required Properties
  - (**NOT NEEDED** but include "just in case") scale: TEXT [CALSCALE](https://icalendar.org/iCalendar-RFC-5545/3-7-1-calendar-scale.html)
    - Fixed value: `CALSCALE:GREGORIAN` (default value)
    - Automatically provided by this application
  - (**NOT NEEDED**) version: TEXT [VERSION](https://icalendar.org/iCalendar-RFC-5545/3-7-4-version.html)
    - Fixed value: `VERSION:2.0` (default value)
    - Automatically provided by the `ical-generator` library
  - productID: TEXT [PRODID](https://icalendar.org/iCalendar-RFC-5545/3-7-3-product-identifier.html)
    - Must be globally unique identifier
    - Automatically provided by this application
    - Use fixed value for this project (maybe `PRODID:-//Paqrat76//ical-gen-app//EN`)
      - By definition, GitHub repository names are globally unique

- Optional Properties
  - `name`: TEXT [NAME](https://icalendar.org/New-Properties-for-iCalendar-RFC-7986/5-1-name-property.html)
  - `description`: TEXT [DESCRIPTION](https://icalendar.org/New-Properties-for-iCalendar-RFC-7986/5-2-description-property.html)
  - `events`: one or more `VEVENT` Objects

### Event Properties (`VEVENT`)

**NOTE:** Only lists those properties needed or useful for this project.

- Required Properties
  - uniqueID: TEXT [UID](https://icalendar.org/iCalendar-RFC-5545/3-8-4-7-unique-identifier.html)
    - MUST be a globally unique identifier
    - Automatically provided by this application (use UUID)
  - date-time-stamp: DATE-TIME [DTSTAMP](https://icalendar.org/iCalendar-RFC-5545/3-8-7-2-date-time-stamp.html)
    - Must be ISO 8601 formatted date-time string as UTC
    - Automatically provided by this application
    - Use the current date-time the iCalendar file is generated for each event
  - `start`: DATE-TIME | DATE [DTSTART](https://icalendar.org/iCalendar-RFC-5545/3-8-2-4-date-time-start.html)
    - Use ical-generator's `allDay` boolean property together with `start` to define all day events
      - Automatically provided by this application

- Optional Properties
  - `end`: DATE-TIME | DATE [DTEND](https://icalendar.org/iCalendar-RFC-5545/3-8-2-2-date-time-end.html)
  - `categories`: TEXT [CATEGORIES](https://icalendar.org/iCalendar-RFC-5545/3-8-1-2-categories.html)
    - Use for grouping events (e.g., US FEDERAL HOLIDAY, HOLIDAY, BIRTHDAY, ANNIVERSARY, OBSERVANCE, etc.)
  - classification: TEXT [CLASS](https://icalendar.org/iCalendar-RFC-5545/3-8-1-3-classification.html)
    - Fixed value: `CLASS:PUBLIC`
    - Automatically provided by this application
  - `summary`: TEXT [SUMMARY](https://icalendar.org/iCalendar-RFC-5545/3-8-1-12-summary.html)
    - Max length: 255 characters
  - `description`: TEXT [DESCRIPTION](https://icalendar.org/iCalendar-RFC-5545/3-8-1-5-description.html)
  - `location`: TEXT [LOCATION](https://icalendar.org/iCalendar-RFC-5545/3-8-1-7-location.html)
  - transparency: TEXT [TRANSP](https://icalendar.org/iCalendar-RFC-5545/3-8-2-7-time-transparency.html)
    - Automatically provided by this application-
    - Fixed value: `TRANSP:TRANSPARENT` for all day events
    - Fixed value: `TRANSP:OPAQUE` for regular events having a start and end time
  - `recurrence rule`: RECUR [RRULE](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)
    - Use [jakubroztocil/rrule](https://www.npmjs.com/package/rrule)
    - Limited support for this property by various calendars
  - `recurrence date-times`: RDATE [RDATE](https://icalendar.org/iCalendar-RFC-5545/3-8-5-2-recurrence-date-times.html)
    - Use [jakubroztocil/rrule](https://www.npmjs.com/package/rrule)
    - Not supported by by various calendars
  - `exception date-times`: EXDATE [EXDATE](https://icalendar.org/iCalendar-RFC-5545/3-8-5-1-exception-date-times.html)
    - Use [jakubroztocil/rrule](https://www.npmjs.com/package/rrule)
    - Not supported by by various calendars

## iCalendar Source JSON Specification

For this project, the iCalendar source JSON specification is designed to provide a structured representation of iCalendar
data, facilitating the generation of iCalendar files.
The specification defines the structure and properties of iCalendar objects, ensuring compatibility and interoperability
with various iCalendar implementations.

### Base JSON Structure

```json
{
  "name": "required calendar name goes here",
  "description": "optional calendar description goes here",
  "events": [
    {
      "allDayStart": "required ISO 8601 formatted date string (e.g., 19970714)",
      "start": "required ISO 8601 formatted UTC datetime string (e.g., 19980119T070000Z)",
      "end": "required ISO 8601 formatted UTC datetime string (e.g., 19980119T080000Z)",
      "summary": "required event summary goes here",
      "description": "optional event description goes here",
      "categories": ["optional list of 1 or more categories"],
      "location": "optional event location goes here",
      "recurrenceRule": "optional recurrence rule string (e.g., FREQ=DAILY;COUNT=5)",
      "recurrenceDates": ["optional list of ISO 8601 formatted date/datetime strings"],
      "exceptionDates": ["optional list of ISO 8601 formatted date/datetime strings"]
    }
  ]
}
```

**NOTE:** The `allDayStart` property is used to define the start date of all day events.
The `start` and `end` properties are used to define the start and end datetime of timed events.
The `allDayStart` property and the `start` and `end` properties are mutually exclusive!
