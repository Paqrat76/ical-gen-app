import {
  ICalValidationResult,
  INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE,
  INVALID_ICAL_TYPE_ERROR_MESSAGE,
  INVALID_ICAL_TYPE_ERROR,
  validateICalendarJson,
} from '../src/json-schema-validator';

describe('validateICalendarJson', () => {
  it('should return valid result for correct iCalendar JSON data for allDay event', () => {
    const validData = {
      name: 'Sample Calendar',
      description: 'A test calendar',
      events: [
        {
          summary: 'Sample Event',
          allDayStart: '2026-02-23',
          recurrenceRule: 'RRULE:FREQ=YEARLY',
        },
      ],
    };

    const result: ICalValidationResult = validateICalendarJson(validData);

    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
    expect(result.errors).toBeUndefined();
  });

  it('should return valid result for correct iCalendar JSON data for timed event', () => {
    const validData = {
      name: 'Sample Calendar',
      description: 'A test calendar',
      events: [
        {
          summary: 'Sample Event',
          start: '2026-02-23T10:30:00.123-04:00',
          end: '2026-02-23T11:15:00.456-04:00',
        },
      ],
    };

    const result: ICalValidationResult = validateICalendarJson(validData);

    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
    expect(result.errors).toBeUndefined();
  });

  it('should handle completely empty input as invalid', () => {
    let result: ICalValidationResult = validateICalendarJson(null);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toEqual([INVALID_ICAL_TYPE_ERROR]);

    result = validateICalendarJson(undefined);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toEqual([INVALID_ICAL_TYPE_ERROR]);

    // @ts-expect-error: expect error
    result = validateICalendarJson();
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toEqual([INVALID_ICAL_TYPE_ERROR]);
  });

  it('should return invalid result for incorrect JSON structure for events', () => {
    const invalidEventType = {
      name: 'Invalid Event Type',
      events: 'this should be an array',
    };
    let result: ICalValidationResult = validateICalendarJson(invalidEventType);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toEqual([INVALID_ICAL_TYPE_ERROR]);

    const expectedError = {
      instancePath: '/events',
      keyword: 'minItems',
      message: 'must NOT have fewer than 1 items',
      params: {
        limit: 1,
      },
      schemaPath: '#/properties/events/minItems',
    };
    const emptyEventArray = {
      name: 'Empty Event Array',
      events: [],
    };
    result = validateICalendarJson(emptyEventArray);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE);
    expect(result.errors).toEqual([expectedError]);
  });

  it('should return invalid result for invalid date/datetime formats', () => {
    const invalidAllDayEvent = {
      name: 'Invalid Event Calendar',
      events: [
        {
          summary: 'Invalid AllDay Event',
          allDayStart: 'invalid-date-format',
        },
      ],
    };
    let result: ICalValidationResult = validateICalendarJson(invalidAllDayEvent);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE);
    expect(result.errors).toBeDefined();
    expect(result.errors).toMatchSnapshot();

    const invalidTimedEvent = {
      name: 'Invalid Event Calendar',
      events: [
        {
          summary: 'Invalid Timed Event',
          start: 'invalid-datetime-format',
          end: 'invalid-datetime-format',
        },
      ],
    };
    result = validateICalendarJson(invalidTimedEvent);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE);
    expect(result.errors).toBeDefined();
    expect(result.errors).toMatchSnapshot();
  });

  it('should handle missing required fields as invalid', () => {
    const missingFieldsData = {
      description: 'Missing calendar name and required event summary',
      events: [
        {
          description: 'Missing all day event summary',
          allDayStart: '2026-02-23',
        },
        {
          description: 'Missing timed event summary',
          start: '2026-02-23T10:30:00.123-04:00',
          end: '2026-02-23T11:15:00.456-04:00',
        },
      ],
    };

    const result: ICalValidationResult = validateICalendarJson(missingFieldsData);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toBeDefined();
    expect(result.errors).toMatchSnapshot();
  });
});
