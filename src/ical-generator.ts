import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import { ICalCalendar, ICalCategory, ICalEvent, ICalEventClass, ICalEventTransparency } from 'ical-generator';
import { ICalAllDayEvent, ICalBaseData, ICalTimedEvent } from './json-schema-validator';

export const ICAL_PRODUCT_ID = '-//Paqrat76//ical-gen-app//EN';
export const ICAL_SCALE_GREGORIAN = 'GREGORIAN';
const DTSTAMP_ISO_OPTIONS = { precision: 'seconds' } as const;

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
  if (event.description) {
    icalEvent.description(event.description);
  }

  if (event.location) {
    icalEvent.location(event.location);
  }

  if (event.categories?.length) {
    const categories = event.categories.map((name) => new ICalCategory({ name }));
    icalEvent.categories(categories);
  }

  if (event.recurrenceRule) {
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

  if (sourceData.description) {
    calendar.description(sourceData.description);
  }

  // Ref: RFC 5545, Sections
  // [3.8.7.2](https://icalendar.org/iCalendar-RFC-5545/3-8-7-2-date-time-stamp.html)
  // [3.3.5](https://icalendar.org/iCalendar-RFC-5545/3-3-5-date-time.html)
  const dtStamp = DateTime.utc().toISO(DTSTAMP_ISO_OPTIONS);

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
