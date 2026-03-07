import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import {
  ICalAlarm,
  ICalAlarmType,
  ICalAttendeeData,
  ICalAttendeeRole,
  ICalCalendar,
  ICalCategory,
  ICalEvent,
  ICalEventClass,
  ICalEventTransparency,
} from 'ical-generator';
import { ICalAllDayEvent, ICalBaseData, ICalTimedEvent } from './json-schema-validator';
import { isNonEmptyString } from './utils';

export const ICAL_PRODUCT_ID = '-//Paqrat76//ical-gen-app//EN';
export const ICAL_SCALE_GREGORIAN = 'GREGORIAN';

/**
 * An object that maps time units to their respective durations in seconds.
 * The values are constant and represent the number of seconds in each time unit.
 *
 * Properties:
 * - `minute`: The number of seconds in a minute.
 * - `hour`: The number of seconds in an hour.
 * - `day`: The number of seconds in a day.
 * - `week`: The number of seconds in a week.
 */
const notificationUnitToSeconds = {
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
} as const;

/**
 * Generates a timestamp in ISO 8601 format without milliseconds.
 *
 * The returned string represents the current date and time,
 * with the milliseconds portion removed, and ends with 'Z'
 * to indicate UTC.
 *
 * @returns {string} A string representation of the current date
 * and time in ISO 8601 format, excluding milliseconds.
 */
function getDtStamp(): string {
  const now = new Date();
  now.setMilliseconds(0);
  return now.toISOString().replace('.000Z', 'Z');
}

/**
 * Determines if the given event is an all-day event.
 *
 * @param event - The event object to evaluate, which can either be an all-day event or a timed event.
 * @returns Returns true if the event is an all-day event, otherwise false.
 */
function isAllDayEvent(event: ICalAllDayEvent | ICalTimedEvent): event is ICalAllDayEvent {
  return 'allDayStart' in event;
}

/**
 * Applies optional fields from the provided event object to the given iCalEvent instance.
 *
 * @param {ICalEvent} icalEvent - The iCalEvent instance to which the optional fields will be applied.
 * @param {ICalAllDayEvent | ICalTimedEvent} event - The source event containing optional fields such as description, location, categories, and recurrence rule.
 * @returns {void} Does not return a value.
 */
function applyOptionalFields(icalEvent: ICalEvent, event: ICalAllDayEvent | ICalTimedEvent): void {
  if (isNonEmptyString(event.description)) {
    icalEvent.description(event.description);
  }

  if (isNonEmptyString(event.location)) {
    icalEvent.location(event.location);
  }

  if (event.categories?.length) {
    const categories = event.categories.map((name) => new ICalCategory({ name }));
    icalEvent.categories(categories);
  }

  if (event.notifications?.length) {
    const notifications = event.notifications.map((notification) => {
      // NOTE: The ical-generator's ICalAlarm.trigger property expects positive seconds for notifications BEFORE the event.
      const triggerSeconds = notification.trigger * notificationUnitToSeconds[notification.unit];

      const alarm = new ICalAlarm(
        {
          trigger: triggerSeconds,
          summary: event.summary,
        },
        icalEvent,
      );

      if (notification.emails?.length) {
        alarm.type(ICalAlarmType.email);
        const attendees: ICalAttendeeData[] = notification.emails.map((email: string) => {
          // Add the email address and override the default role from REQ to NON.
          return { email: email, role: ICalAttendeeRole.NON } satisfies ICalAttendeeData;
        });
        alarm.attendees(attendees);
        if (isNonEmptyString(event.description)) {
          // Used to set the email body. Summary is used to set the email subject.
          alarm.description(event.description);
        }
      } else {
        alarm.type(ICalAlarmType.display);
        // Sets the alarm message if the alarm type is display to the event summary.
        alarm.description(event.summary);
      }

      return alarm;
    });
    icalEvent.alarms(notifications);
  }

  if (isNonEmptyString(event.recurrenceRule)) {
    icalEvent.repeating(event.recurrenceRule);
  }
}

/**
 * Applies timing and transparency properties from a given event to an iCalendar event.
 * The `start` property of the event was already applied to the iCalendar event instance in the calling function.
 *
 * @param {ICalEvent} icalEvent - The iCalendar event instance to which the timing and transparency properties will be applied.
 * @param {ICalAllDayEvent | ICalTimedEvent} event - The event containing the timing details to be applied. It may be an all-day event or a timed event.
 * @returns {void} Does not return a value.
 */
function applyEventTiming(icalEvent: ICalEvent, event: ICalAllDayEvent | ICalTimedEvent): void {
  if (isAllDayEvent(event)) {
    icalEvent.allDay(true);
    icalEvent.transparency(ICalEventTransparency.TRANSPARENT);
    return;
  }

  icalEvent.end(event.end);
  icalEvent.transparency(ICalEventTransparency.OPAQUE);
}

/**
 * Generates an iCalendar object based on the provided source data.
 *
 * Assumption: The source data is expected to be a valid JSON object conforming to the iCalendar schema.
 * In the application flow, the JSON data is validated before being passed to this function and exits beforehand
 * if invalid.
 *
 * @param {ICalBaseData} sourceData - The JSON object containing iCalendar data.
 * It includes properties like the calendar name, description, and a collection of events.
 *
 * @returns {ICalCalendar} The generated iCalendar object populated with the provided data.
 */
export function generateICalendarObject(sourceData: ICalBaseData): ICalCalendar {
  assert.ok(sourceData, 'sourceData is required.');

  const calendar = new ICalCalendar({
    name: sourceData.name,
    prodId: ICAL_PRODUCT_ID,
    scale: ICAL_SCALE_GREGORIAN,
  });

  if (isNonEmptyString(sourceData.description)) {
    calendar.description(sourceData.description);
  }

  // Ref: RFC 5545, Sections
  // [3.8.7.2](https://icalendar.org/iCalendar-RFC-5545/3-8-7-2-date-time-stamp.html)
  // [3.3.5](https://icalendar.org/iCalendar-RFC-5545/3-3-5-date-time.html)
  const dtStamp = getDtStamp();

  for (const event of sourceData.events) {
    const eventStart = isAllDayEvent(event) ? event.allDayStart : event.start;

    const icalEvent = calendar.createEvent({
      id: randomUUID(),
      stamp: dtStamp,
      class: ICalEventClass.PUBLIC,
      start: eventStart,
      summary: event.summary,
    });

    applyOptionalFields(icalEvent, event);
    applyEventTiming(icalEvent, event);
  }

  return calendar;
}
