import {
  ICalValidationResult,
  INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE,
  INVALID_ICAL_TYPE_ERROR_MESSAGE,
  INVALID_ICAL_TYPE_ERROR,
  validateICalendarJson,
} from '../src/json-schema-validator';

describe('validateICalendarJson', () => {
  // TODO: Fill out snapshot tests for invalid cases

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

  it('should return invalid result for incorrect JSON structure', () => {
    const invalidData = {
      name: 'Invalid Calendar',
      events: 'this should be an array',
    };

    const result: ICalValidationResult = validateICalendarJson(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_TYPE_ERROR_MESSAGE);
    expect(result.errors).toEqual([INVALID_ICAL_TYPE_ERROR]);
  });

  it('should return invalid result for JSON not adhering to schema', () => {
    const invalidSchemaData = {
      name: 'Invalid Event Calendar',
      events: [
        {
          summary: 'Invalid Event',
          start: 'invalid-date-format',
          end: 'invalid-date-format',
        },
      ],
    };

    const result: ICalValidationResult = validateICalendarJson(invalidSchemaData);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE);
    expect(result.errors).toBeDefined();
    expect(result.errors).toMatchSnapshot();
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

  it('should handle missing required fields as invalid', () => {
    const missingFieldsData = {
      name: 'Missing required events',
      events: [],
    };

    const result: ICalValidationResult = validateICalendarJson(missingFieldsData);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE);
    expect(result.errors).toBeDefined();
    expect(result.errors).toMatchSnapshot();
  });
});
