import { ICalCalendar } from 'ical-generator';
import { generateICalendarObject, ICAL_PRODUCT_ID, ICAL_SCALE_GREGORIAN } from '../src/ical-generator';
import { ICalBaseData } from '../src/json-schema-validator';

describe('generateICalendarObject', () => {
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

  it('should generate a minimal iCalendar object with an all day event', () => {
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

  it('should generate a full iCalendar object with an all day event', () => {
    const sourceData: ICalBaseData = {
      name: 'All-Day Event Calendar',
      description: 'This is a test calendar',
      events: [
        {
          summary: 'All-Day Test Event',
          description: 'Sample one time all day event description',
          allDayStart: '2026-02-24',
          categories: ['Category'],
          location: 'Sample Location, 123 Main St, Anytown, USA',
          recurrenceRule: 'RRULE:FREQ=YEARLY;COUNT=10',
          notifications: [
            { trigger: 15, unit: 'minute' },
            { trigger: 1, unit: 'day', emails: ['email1@example.com', 'email2@example.com'] },
          ],
        },
      ],
    };

    const calendar = generateICalendarObject(sourceData);
    expect(calendar).toBeDefined();
    expect(calendar.name()).toStrictEqual('All-Day Event Calendar');
    expect(calendar.description()).toStrictEqual('This is a test calendar');
    expect(calendar.prodId()).toStrictEqual('-//Paqrat76//ical-gen-app//EN');
    expect(calendar.scale()).toStrictEqual('GREGORIAN');
    // Expected unused properties:
    expect(calendar.method()).toBeNull();
    expect(calendar.source()).toBeNull();
    expect(calendar.timezone()).toBeNull();
    expect(calendar.ttl()).toBeNull();
    expect(calendar.url()).toBeNull();
    expect(calendar.x()).toStrictEqual([]);

    expect(calendar.events().length).toBe(1);
    const event = calendar.events()[0];
    expect(event).toBeDefined();
    expect(event?.allDay()).toBe(true);
    expect(JSON.stringify(event?.categories())).toStrictEqual(JSON.stringify([{ name: 'Category' }]));
    expect(event?.class()).toStrictEqual(FIXED_CLASS);
    expect(event?.description()).toStrictEqual({ plain: 'Sample one time all day event description' });
    expect(event?.id()).toMatch(REGEX_ID);
    expect(event?.location()).toStrictEqual({ title: 'Sample Location, 123 Main St, Anytown, USA' });
    expect(event?.repeating()).toStrictEqual('RRULE:FREQ=YEARLY;COUNT=10');
    expect(event?.stamp()).toMatch(REGEX_STAMP);
    expect(event?.start()).toStrictEqual('2026-02-24');
    expect(event?.summary()).toStrictEqual('All-Day Test Event');
    expect(event?.transparency()).toStrictEqual(FIXED_TRANSPARENCY_TRANSPARENT);
    expect(event?.alarms()).toMatchSnapshot();
    // Expected unused properties:
    expect(event?.attachments()).toStrictEqual([]);
    expect(event?.attendees()).toStrictEqual([]);
    expect(event?.busystatus()).toBeNull();
    expect(event?.created()).toBeNull();
    expect(event?.end()).toBeNull();
    expect(event?.floating()).toBe(false);
    expect(event?.lastModified()).toBeNull();
    expect(event?.organizer()).toBeNull();
    expect(event?.priority()).toBeNull();
    expect(event?.recurrenceId()).toBeNull();
    expect(event?.sequence()).toStrictEqual(0);
    expect(event?.status()).toBeNull();
    expect(event?.timezone()).toBeNull();
    expect(event?.url()).toBeNull();
    expect(event?.x()).toStrictEqual([]);
  });

  it('should generate a minimal iCalendar object with a timed event', () => {
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

  it('should generate a full iCalendar object with a timed event', () => {
    const sourceData: ICalBaseData = {
      name: 'Eventful Calendar',
      description: 'This is a test calendar',
      events: [
        {
          summary: 'Timed Test Event',
          description: 'Sample one time timed event description',
          start: '2026-02-24T10:00:00-04:00',
          end: '2026-02-24T11:00:00-04:00',
          categories: ['Category'],
          location: 'Sample Location, 123 Main St, Anytown, USA',
          recurrenceRule: 'RRULE:FREQ=YEARLY;COUNT=10',
          notifications: [
            { trigger: 15, unit: 'minute' },
            { trigger: 1, unit: 'day', emails: ['email1@example.com', 'email2@example.com'] },
          ],
        },
      ],
    };

    const calendar = generateICalendarObject(sourceData);
    expect(calendar).toBeDefined();
    expect(calendar.name()).toStrictEqual('Eventful Calendar');
    expect(calendar.description()).toStrictEqual('This is a test calendar');
    expect(calendar.prodId()).toStrictEqual('-//Paqrat76//ical-gen-app//EN');
    expect(calendar.scale()).toStrictEqual('GREGORIAN');
    // Expected unused properties:
    expect(calendar.method()).toBeNull();
    expect(calendar.source()).toBeNull();
    expect(calendar.timezone()).toBeNull();
    expect(calendar.ttl()).toBeNull();
    expect(calendar.url()).toBeNull();
    expect(calendar.x()).toStrictEqual([]);

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
    expect(event?.summary()).toStrictEqual('Timed Test Event');
    expect(event?.alarms()).toMatchSnapshot();
    // Expected unused properties:
    expect(event?.attachments()).toStrictEqual([]);
    expect(event?.attendees()).toStrictEqual([]);
    expect(event?.busystatus()).toBeNull();
    expect(event?.created()).toBeNull();
    expect(event?.floating()).toBe(false);
    expect(event?.lastModified()).toBeNull();
    expect(event?.organizer()).toBeNull();
    expect(event?.priority()).toBeNull();
    expect(event?.recurrenceId()).toBeNull();
    expect(event?.sequence()).toStrictEqual(0);
    expect(event?.status()).toBeNull();
    expect(event?.timezone()).toBeNull();
    expect(event?.url()).toBeNull();
    expect(event?.x()).toStrictEqual([]);
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
