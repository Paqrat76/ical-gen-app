import { resolve } from 'node:path';
import Ajv, { ErrorObject, JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readJsonFile } from './utils';

export const ICAL_SCHEMA_PATH = resolve(__dirname, '../src/schema/ical-gen-app-schema.json');

export const INVALID_ICAL_TYPE_ERROR_MESSAGE = 'Provided JSON data is not a valid ICalBaseData object.';
export const INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE =
  "Provided JSON data failed schema validation. See 'errors' for details.";

export const INVALID_ICAL_TYPE_ERROR = {
  keyword: 'type',
  instancePath: '$',
  schemaPath: '$',
  params: { type: 'ICalBaseData' },
  message: INVALID_ICAL_TYPE_ERROR_MESSAGE,
} satisfies ErrorObject;

export interface ICalAllDayEvent extends ICalBaseEvent {
  // Ref: https://datatracker.ietf.org/doc/html/rfc3339#section-5.6: full-date format only; Enforced by Ajv schema validation
  allDayStart: string;
}
export interface ICalTimedEvent extends ICalBaseEvent {
  // Ref: https://datatracker.ietf.org/doc/html/rfc3339#section-5.6: date-time format only; Enforced by Ajv schema validation
  start: string;
  end: string;
}
export interface ICalBaseEvent {
  summary: string;
  description?: string;
  categories?: string[];
  location?: string;
  recurrenceRule?: string;
  recurrenceDates?: string[];
  exceptionDates?: string[];
}
export interface ICalBaseData {
  name: string;
  description?: string;
  events: (ICalAllDayEvent | ICalTimedEvent)[];
}

/**
 * Interface representing the result of an iCalendar data validation.
 *
 * @interface
 * @property {boolean} isValid - Indicates whether the iCalendar data is valid.
 * @property {string} [message] - Optional descriptive message about the validation result.
 * @property {(ErrorObject[] | null | undefined)} [errors] - Optional collection of error details, if any were encountered during validation.
 */
export interface ICalValidationResult {
  isValid: boolean;
  message?: string;
  errors?: ErrorObject[] | null | undefined;
}

/**
 * Compiles and returns an AJV validation function based on the iCal schema.
 *
 * This method reads the iCalendar JSON schema definition from a file, parses it,
 * and creates an AJV instance with custom formats. The schema is then compiled
 * into a validation function using the AJV library, which can be used to validate
 * iCalendar data objects against the schema.
 *
 * @returns {ValidateFunction} The compiled AJV validation function for the iCal schema.
 */
function getAjvValidateFunction(): ValidateFunction {
  // Use the 'strictTypes: false' option while awaiting PR https://github.com/fastify/fluent-json-schema/pull/280#issue-3198794563
  // approval/merge/release
  const ajv = new Ajv({ allErrors: true, strictTypes: false });
  addFormats(ajv);

  const iCalSchema = readJsonFile(ICAL_SCHEMA_PATH) as JSONSchemaType<ICalBaseData>;
  return ajv.compile(iCalSchema);
}

/**
 * Checks if the given value conforms to the ICalBaseData interface.
 * The function determines if the value is an object with properties `name` and `events`,
 * where `events` is an array.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} Returns true if the value is of type ICalBaseData, otherwise false.
 */
function isICalData(value: unknown): value is ICalBaseData {
  return (
    typeof value === 'object' && value !== null && 'name' in value && 'events' in value && Array.isArray(value.events)
  );
}

/**
 * Validates whether the provided JSON data adheres to the iCalendar schema.
 *
 * @param {unknown} jsonData - The JSON data to be validated against the iCalendar schema.
 * @returns {ICalValidationResult} An object containing the validation result and any associated messages or errors.
 */
export function validateICalendarJson(jsonData: unknown): ICalValidationResult {
  if (!isICalData(jsonData)) {
    return {
      isValid: false,
      message: INVALID_ICAL_TYPE_ERROR.message,
      errors: [INVALID_ICAL_TYPE_ERROR],
    };
  }

  const validateWithSchema = getAjvValidateFunction();
  const isValid = validateWithSchema(jsonData);

  if (isValid) return { isValid: true };

  const errors = validateWithSchema.errors;
  return {
    isValid: false,
    message: INVALID_ICAL_SCHEMA_VALIDATION_MESSAGE,
    errors,
  };
}
