# ical-gen-app

The ical-gen-app command line application consumes a JSON file containing calendar event data and generates an iCalendar
file.

The intent is to use a JSON source file containg event details to generate an iCalendar file (e.g., `myCalendar.ics`)
containing multiple fixed and/or recurring events for calendars that can be imported into various calendar applications.
These calendars can be used for events such as holidays or family dates (e.g., birthdays, anniversaries, etc.) that are
defined as specifying dates only and require no interactions such as invitations or reminders.
Additionally, events having a start and end datetime, such as sporting events or any event requiring a specific time slot,
can be easily added to the calendar.
Each event type can also support the definition of a recurrence rule such as "yearly" or "yearly on the 15th of February"
or "every other week".

## References

- [iCalendar.org](https://icalendar.org)
- [RFC-5545](https://www.rfc-editor.org/rfc/rfc5545)
  - [RFC 7986](https://www.rfc-editor.org/rfc/rfc7986)
- [iCalendar (RFC 5545)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-5545/)
  - [iCalendar (RFC 7986)](https://icalendar.org/RFC-Specifications/iCalendar-RFC-7986/)

## Dependencies

- [sebbo2002/ical-generator](https://www.npmjs.com/package/ical-generator) - Library with which you can very easily
  create a valid iCal calendar
