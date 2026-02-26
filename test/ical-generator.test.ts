import { ICalCalendar } from 'ical-generator';
import { generateICalendarObject, ICAL_PRODUCT_ID, ICAL_SCALE_GREGORIAN } from '../src/ical-generator';
import { ICalBaseData } from '../src/json-schema-validator';

describe('generateICalendarObject', () => {
  // TODO: Fill out test cases for all properties of ICalBaseData

  // NOTE: The empty 'events' array is allowed here because the JSON schema validation is carried out before calling
  // generateICalendarObject(...).

  const FIXED_CLASS = 'PUBLIC';
  const FIXED_TRANSPARENCY_OPAQUE = 'OPAQUE';
  const FIXED_TRANSPARENCY_TRANSPARENT = 'TRANSPARENT';
  const REGEX_ID = /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/;
  const REGEX_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

  it('should generate an iCalendar object with the provided name and description', () => {
    const sourceData: ICalBaseData = {
      name: 'Test Calendar',
      description: 'This is a test calendar',
      events: [],
    };

    const calendar = generateICalendarObject(sourceData);

    expect(calendar).toBeInstanceOf(ICalCalendar);
    expect(calendar.prodId()).toStrictEqual(ICAL_PRODUCT_ID);
    expect(calendar.scale()).toStrictEqual(ICAL_SCALE_GREGORIAN);
    expect(calendar.name()).toStrictEqual('Test Calendar');
    expect(calendar.description()).toStrictEqual('This is a test calendar');
  });

  it('should generate an iCalendar object without a description if not provided', () => {
    const sourceData: ICalBaseData = {
      name: 'Test Calendar',
      events: [],
    };

    const calendar = generateICalendarObject(sourceData);

    expect(calendar).toBeInstanceOf(ICalCalendar);
    expect(calendar.prodId()).toStrictEqual(ICAL_PRODUCT_ID);
    expect(calendar.scale()).toStrictEqual(ICAL_SCALE_GREGORIAN);
    expect(calendar.name()).toStrictEqual('Test Calendar');
    expect(calendar.description()).toBeNull();
  });

  it('should add timed-events to the iCalendar object correctly', () => {
    const sourceData: ICalBaseData = {
      name: 'Eventful Calendar',
      events: [
        {
          start: '2026-02-24T10:00:00-04:00',
          end: '2026-02-24T11:00:00-04:00',
          summary: 'Test Event',
        },
      ],
    };

    const calendar = generateICalendarObject(sourceData);

    expect(calendar.events().length).toBe(1);
    const event = calendar.events()[0];
    expect(event).toBeDefined();
    expect(event?.allDay()).toBe(false);
    expect(event?.class()).toStrictEqual(FIXED_CLASS);
    expect(event?.id()).toMatch(REGEX_ID);
    expect(event?.stamp()).toMatch(REGEX_STAMP);
    expect(event?.transparency()).toStrictEqual(FIXED_TRANSPARENCY_OPAQUE);
    expect(event?.start()).toStrictEqual('2026-02-24T10:00:00-04:00');
    expect(event?.end()).toStrictEqual('2026-02-24T11:00:00-04:00');
    expect(event?.summary()).toStrictEqual('Test Event');
  });

  it('should add all-day events to the iCalendar object correctly', () => {
    const sourceData: ICalBaseData = {
      name: 'All-Day Event Calendar',
      events: [
        {
          allDayStart: '2026-02-24',
          summary: 'All-Day Test Event',
        },
      ],
    };

    const calendar = generateICalendarObject(sourceData);

    expect(calendar.events().length).toBe(1);

    const event = calendar.events()[0];
    expect(event).toBeDefined();
    expect(event?.allDay()).toBe(true);
    expect(event?.class()).toStrictEqual(FIXED_CLASS);
    expect(event?.id()).toMatch(REGEX_ID);
    expect(event?.stamp()).toMatch(REGEX_STAMP);
    expect(event?.transparency()).toStrictEqual(FIXED_TRANSPARENCY_TRANSPARENT);
    expect(event?.start()).toStrictEqual('2026-02-24');
    expect(event?.summary()).toStrictEqual('All-Day Test Event');
  });

  it('should throw an error if sourceData is not provided', () => {
    // @ts-expect-error: The function should not allow undefined as input
    expect(() => generateICalendarObject(undefined)).toThrow('sourceData is required.');
    // @ts-expect-error: The function should not allow null as input
    expect(() => generateICalendarObject(null)).toThrow('sourceData is required.');
    // @ts-expect-error: The function should not allow empty input
    expect(() => generateICalendarObject()).toThrow('sourceData is required.');
  });
});
