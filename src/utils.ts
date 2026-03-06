import os from 'node:os';
import { accessSync, constants, readFileSync, statSync } from 'node:fs';
import { extname, normalize, resolve } from 'node:path';
import { inspect } from 'node:util';

export const OS_EOL = os.EOL;

const REGEX_STACK_TRACE_EOL = /\r?\n/;
const REGEX_STACK_TRACE_LINE = /at\s+(.+)\s+(.+)/;

/**
 * Extract method name using the Error.stack.
 *
 * @returns Method name or empty string if unknown
 */
export function getDebugSource(): string {
  // NOTE: The stack property is de facto implemented by all major JavaScript engines, and the
  //       JavaScript standards committee is looking to standardize it. You cannot rely on the
  //       precise content of the stack string due to implementation inconsistencies, but you
  //       can generally assume it exists and use it for debugging purposes.
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
  // ================================================================
  // Node implementation: https://nodejs.org/docs/latest-v24.x/api/errors.html#errorstack (V8 JavaScript engine)
  // Casual observations indicate the following (from Linux OS):
  // ASSUMPTION: Purely anonymous functions ARE NOT included in this application.
  // stack trace:
  // - line 0 - "Error:"
  // - line 1 - "at getDebugSource (<file path>:line:column)"
  // - line 2 - "at <class name>.logDebug (<file path>:line:column)"
  // - line 3 - "at <method where logDebug(...) is called> (<file path>:line:column)"
  // - line 4 ...
  // ================================================================
  // Unknown, therefore, return an empty string since any "default" value would be meaningless
  const DEFAULT_RETURN_VALUE = '';
  // Create a new Error object to get the current stack trace
  const stackTrace = new Error().stack;
  // In the Node/V8 JavaScript engine, stacktrace should have data, but just in case...
  if (!stackTrace || stackTrace.length === 0) return DEFAULT_RETURN_VALUE;
  const stackLines: string[] = stackTrace.split(REGEX_STACK_TRACE_EOL);
  if (stackLines.length >= 4) {
    const stackLine = stackLines[3]?.trim();
    if (!stackLine) return DEFAULT_RETURN_VALUE;
    const regexResult = REGEX_STACK_TRACE_LINE.exec(stackLine);
    return regexResult?.[1] ?? DEFAULT_RETURN_VALUE;
  } else {
    return DEFAULT_RETURN_VALUE;
  }
}

/**
 * Verifies that the provided file path points to an existing, readable JSON file. Performs validation and normalization of the file path.
 *
 * @param {string} propertyName - The name of the property being validated, to use in error messages.
 * @param {string} filePath - The file path to validate, normalize, and check for existence and readability.
 * @returns {string} The absolute, normalized file path if it passes all validation checks.
 * @throws {Error} If validation fails.
 */
export function verifyJsonFilePath(propertyName: string, filePath: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (propertyName === undefined || propertyName === null) {
    throw new Error(`propertyName is required.`);
  }
  if (!propertyName.trim()) {
    throw new Error(`propertyName is required.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (filePath === undefined || filePath === null) {
    throw new Error(`${propertyName} is required.`);
  }
  const candidate = filePath.trim();
  if (!candidate) {
    throw new Error(`${propertyName} is required.`);
  }

  // Normalize and make absolute in one deterministic step.
  const verifiedFilePath = resolve(normalize(candidate));

  // Validate extension first.
  if (extname(verifiedFilePath).toLowerCase() !== '.json') {
    throw new Error(`${propertyName} (${verifiedFilePath}) does not have a '.json' extension.`);
  }

  let fsStats;
  try {
    fsStats = statSync(verifiedFilePath, { throwIfNoEntry: false });
  } catch (err: unknown) {
    // Unlikely error, but handle just-in-case
    /* istanbul ignore next */
    const message = err instanceof Error ? err.message : String(err);
    /* istanbul ignore next */
    throw new Error(`Unable to inspect ${propertyName} (${verifiedFilePath}): ${message}`, { cause: err });
  }

  if (!fsStats) {
    throw new Error(`${propertyName} (${verifiedFilePath}) does not exist.`);
  }

  if (!fsStats.isFile()) {
    throw new Error(`${propertyName} (${verifiedFilePath}) is not a file.`);
  }

  // Ensure the file is readable by the current process.
  try {
    accessSync(verifiedFilePath, constants.R_OK);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${propertyName} (${verifiedFilePath}) is not readable: ${message}`, { cause: err });
  }

  return verifiedFilePath;
}

/**
 * Reads and parses a JSON file from the specified file path.
 *
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {unknown} The parsed content of the JSON file.
 */
export function readJsonFile(filePath: string): unknown {
  const verifiedFilePath = verifyJsonFilePath('filePath', filePath);

  let content: string;
  try {
    content = readFileSync(verifiedFilePath, 'utf8');
  } catch (err: unknown) {
    // Unlikely error, but handle just-in-case
    /* istanbul ignore next */
    const message = err instanceof Error ? err.message : String(err);
    /* istanbul ignore next */
    throw new Error(`Failed to read JSON file (${verifiedFilePath}): ${message}`, { cause: err });
  }

  try {
    return JSON.parse(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON in file (${verifiedFilePath}): ${message}`, { cause: err });
  }
}

/**
 * Converts a given value into an `Error` object, providing contextual information about the source.
 *
 * @param {unknown} e - The value to be converted into an `Error`.
 * @param {string} source - The context or source of the error, used for generating descriptive messages.
 * @param {string} appVersion - The version of this application (${PKG_NAME}@${PKG_VERSION}).
 * @returns {Error} An `Error` object representing the given value, with contextual information.
 */
export function toError(e: unknown, source: string, appVersion: string): Error {
  const msgPrefix = `Error in ${appVersion}/${source}`;

  if (e instanceof Error) {
    return new Error(`${msgPrefix}: ${e.message}`, { cause: e });
  }

  return new Error(`${msgPrefix}: ${describeUnknownError(e)}`, { cause: e });
}

/**
 * Describes an unknown error value by converting it into a readable string representation.
 *
 * @param {unknown} value - The value to be described, which may be of any type.
 * @returns {string} A string representation of the input value. This can include primitive values, formatted objects,
 *                  or special indicators for null, undefined, and functions.
 * @private
 */
function describeUnknownError(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[function ${value.name || '<anonymous>'}]`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  // Errors stringify poorly with JSON.stringify (often "{}"), so format them explicitly.
  // Not expected, but just in case..
  /* istanbul ignore next */
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  // Node-friendly, safe formatting for objects/arrays/maps/sets/circular refs/etc.
  try {
    const text = inspect(value, {
      depth: 3,
      maxArrayLength: 50,
      breakLength: 120,
      compact: false,
      getters: true,
    });

    const MAX_LEN = 10_000;
    return text.length > MAX_LEN ? `${text.slice(0, MAX_LEN)}… <truncated>` : text;
  } catch {
    // Extremely defensive fallback
    /* istanbul ignore next */
    try {
      return Object.prototype.toString.call(value);
    } catch {
      return '<unprintable value>';
    }
  }
}
