import * as fs from 'node:fs';
import * as path from 'node:path';
import ical, { ICalEventClass, ICalEventTransparency } from 'ical-generator';
import { RRule, RRuleSet, rrulestr } from 'rrule';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

describe('Experimentation Tests', () => {
  describe('Event Creation', () => {
    it('should generate snapshot iCalendar', () => {
      // For snapshot testing, set the stamp value to a fixed date
      const tstamp = new Date(2025, 0, 1, 0, 0, 0, 0);

      const calendar = ical({
        name: 'My First iCal',
        description: 'This is an example iCalendar',
        prodId: '-//Paqrat76//ical-generator//EN',
      });

      const rruleStr0 = 'RRULE:FREQ=YEARLY';
      const rrule0: RRule = rrulestr(rruleStr0);
      expect(rrule0).toBeDefined();
      expect(rrule0.toString()).toStrictEqual(rruleStr0);

      calendar.createEvent({
        stamp: tstamp,
        allDay: true,
        start: new Date(2026, 0, 1),
        id: '1e1e6f37-9ac4-47eb-a9ea-e19666afd322',
        categories: [{ name: 'US FEDERAL HOLIDAY' }, { name: 'HOLIDAY' }],
        class: ICalEventClass.PUBLIC,
        summary: `New Year's Day`,
        transparency: ICalEventTransparency.TRANSPARENT,
        repeating: rrule0.toString(),
      });

      const rruleStr1 = 'RRULE:FREQ=YEARLY;WKST=SU;BYDAY=MO;BYMONTH=1;BYWEEKNO=3';
      const rrule1: RRule = rrulestr(rruleStr1);
      expect(rrule1).toBeDefined();
      expect(rrule1.toString()).toStrictEqual(rruleStr1);

      const rrule2: RRule = new RRule({
        freq: RRule.YEARLY,
        wkst: RRule.SU,
        byweekday: [RRule.MO],
        bymonth: [1],
        byweekno: [3],
      });
      expect(rrule2).toBeDefined();
      expect(rrule2.toString()).toStrictEqual(rruleStr1);

      calendar.createEvent({
        stamp: tstamp,
        allDay: true,
        start: new Date(2026, 0, 19),
        id: '37d8aa1b-d2bc-45bf-943e-c2bd564ecbfa',
        categories: [{ name: 'US FEDERAL HOLIDAY' }, { name: 'HOLIDAY' }],
        class: ICalEventClass.PUBLIC,
        summary: `Martin Luther King, Jr. Day`,
        transparency: ICalEventTransparency.TRANSPARENT,
        repeating: rrule2.toString(),
      });

      calendar.createEvent({
        stamp: tstamp,
        //allDay: true,
        start: new Date(2026, 1, 1, 20, 0, 0),
        end: new Date(2026, 1, 1, 23, 0, 0),
        id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
        categories: [{ name: 'NASCAR CUP' }],
        class: ICalEventClass.PUBLIC,
        summary: `Cook Out Clash (FOX)`,
        description: `200 laps / 50.6 miles | Track Length: 0.25 mile(s) | Track Type: Short Track | Surface: Asphalt | Banking: Turns: 4 | Caution Speed: 20 MPH`,
        location: {
          title: 'Bowman Grey Stadium',
          address: 'Winston Salem, NC',
        },
        transparency: ICalEventTransparency.OPAQUE,
      });

      const iCalString = calendar.toString();
      expect(iCalString).toMatchSnapshot();
    });

    it('should generate snapshot iCalendar for complex recurrence', () => {
      // For snapshot testing, set the stamp value to a fixed date
      const tstamp = new Date(2025, 0, 1, 0, 0, 0, 0);

      const calendar = ical({
        name: 'My Second iCal',
        description: 'This is an example iCalendar with complex recurrence',
        prodId: '-//Paqrat76//ical-generator//EN',
      });

      const rruleSet = new RRuleSet();

      const rruleStr0 = 'RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15;COUNT=10';
      const rrule0: RRule = rrulestr(rruleStr0);
      expect(rrule0).toBeDefined();
      expect(rrule0.toString()).toStrictEqual(rruleStr0);

      rruleSet.rrule(rrule0);
      rruleSet.rdate(new Date(2025, 2, 25));
      rruleSet.rdate(new Date(2025, 3, 25));
      rruleSet.exdate(new Date(2025, 2, 15));
      rruleSet.exdate(new Date(2025, 3, 15));

      calendar.createEvent({
        stamp: tstamp,
        allDay: true,
        start: new Date(2026, 0, 1),
        id: '1e1e6f37-9ac4-47eb-a9ea-e19666afd322',
        categories: [{ name: 'US FEDERAL HOLIDAY' }, { name: 'HOLIDAY' }],
        class: ICalEventClass.PUBLIC,
        summary: `First Day`,
        transparency: ICalEventTransparency.TRANSPARENT,
        repeating: rruleSet,
      });

      const iCalString = calendar.toString();
      expect(iCalString).toMatchSnapshot();
    });
  });

  describe('Event Validation', () => {
    const filepath = path.join(__dirname, '..');
    let validate: ValidateFunction;
    beforeAll(() => {
      // Use the 'strict: false' option while awaiting PR https://github.com/fastify/fluent-json-schema/pull/280#issue-3198794563
      // approval/merge/release
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const iCalSchema = JSON.parse(fs.readFileSync(`${filepath}/tools/ical-generator-schema.json`, 'utf8'));
      validate = ajv.compile(iCalSchema);
    });

    it('should create and successfully validate allDayEvent with minimum properties', () => {
      const iCalData = {
        name: 'My First iCal',
        events: [
          {
            allDayStart: `2025-03-15`,
            id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
            summary: 'Sample Event',
          },
        ],
      };
      const valid = validate(iCalData);
      if (!valid) console.log(validate.errors);
      expect(valid).toBe(true);
    });

    it('should create and successfully validate timedEvent with minimum properties', () => {
      const iCalData = {
        name: 'My First iCal',
        events: [
          {
            start: `2025-03-15T10:00:00Z`,
            end: `2025-03-15T11:00:00Z`,
            id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
            summary: 'Sample Event',
          },
        ],
      };
      const valid = validate(iCalData);
      if (!valid) console.log(validate.errors);
      expect(valid).toBe(true);
    });

    it('should create and successfully validate allDayEvent with all valid properties', () => {
      const iCalData = {
        name: 'My First iCal',
        events: [
          {
            allDayStart: `2025-03-15`,
            id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
            summary: 'Sample Event',
            description: 'Sample Description',
            categories: ['US FEDERAL HOLIDAY', 'HOLIDAY'],
            location: 'Bowman Grey Stadium, Winston Salem, NC',
            recurrenceRule: 'RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15;COUNT=5',
            recurrenceDates: ['2025-03-25', '2025-04-25'],
            exceptionDates: ['2025-03-15', '2025-04-15'],
          },
        ],
      };
      const valid = validate(iCalData);
      if (!valid) console.log(validate.errors);
      expect(valid).toBe(true);
    });

    it('should create and unsuccessfully validate both allDayEvent and timedEvent with minimum properties', () => {
      const iCalData = {
        name: 'My First iCal',
        events: [
          {
            allDayStart: `2025-03-15`,
            start: `2025-03-15T10:00:00Z`,
            end: `2025-03-15T11:00:00Z`,
            id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
            summary: 'Sample Event',
          },
        ],
      };
      const valid = validate(iCalData);
      //if (!valid) console.log(validate.errors);
      expect(valid).toBe(false);
      expect(validate.errors).toBeDefined();
      expect(validate.errors).toHaveLength(1);
      const error0 = {
        instancePath: '/events/0',
        schemaPath: '#/oneOf',
        keyword: 'oneOf',
        params: { passingSchemas: [0, 1] },
        message: 'must match exactly one schema in oneOf',
      };
      // @ts-expect-error: [0] does exist
      expect(validate.errors[0]).toMatchObject(error0);
    });

    it('should create and unsuccessfully validate events with minimum properties', () => {
      const iCalData = {
        name: 'My First iCal',
        description: null,
        events: [
          {
            start: `2025-03-15T10:00:00Z`,
            end: `2025-03-15T11:00:00Z`,
            id: '48e92d47-bdb0-4b01-8283-72bca4c34878',
            summary: 'Sample Event',
          },
        ],
      };
      const valid = validate(iCalData);
      //if (!valid) console.log(validate.errors);
      expect(valid).toBe(false);
      expect(validate.errors).toBeDefined();
      expect(validate.errors).toHaveLength(1);
      const error0 = {
        instancePath: '/description',
        schemaPath: '#/properties/description/type',
        keyword: 'type',
        params: {
          type: 'string',
        },
        message: 'must be string',
      };
      // @ts-expect-error: [0] does exist
      expect(validate.errors[0]).toMatchObject(error0);
    });
  });
});
