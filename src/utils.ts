import { strict as assert } from 'node:assert';
import os from 'node:os';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

export const OS_EOL = os.EOL;

/* istanbul ignore next - unnecessary to unit test */
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
  // Node implementation: https://nodejs.org/docs/latest-v24.x/api/errors.html#errorstack
  // ================================================================
  // Casual observations indicate the following (from Linux OS):
  // stack trace:
  // - line 0 - "Error ..."
  // - line 1 - getDebugSource()
  // - line 2 - logDebug(...)
  // - line 3 - method where logDebug(...) is called
  // - line 4 ...
  // or
  // - line 0 - "Error ..."
  // - line 1 - getDebugSource()
  // - line 2 - logDebug(...)
  // - line 3 - <full path of source file> for an anonymous function
  // - line 4 - (<anonymous>) function
  // - line 5 - method where logDebug(...) is called
  // - line 6 ...
  // ================================================================
  // @ts-expect-error: `stack` is a property of `Error``
  const stackLines = new Error().stack.split(OS_EOL);
  if (stackLines.length >= 4) {
    // @ts-expect-error: `stackLines[3]` is a string
    let stackLine: string = stackLines[3];
    for (let i = 3; i < stackLines.length; i++) {
      // @ts-expect-error: `stackLines[i]` is a string
      if (!stackLines[i].includes('(<anonymous>)') && stackLines[i].includes('(')) {
        // @ts-expect-error: `stackLines[i]` is a string
        stackLine = stackLines[i].trim();
        break;
      }
    }
    // Extract <source> ignoring the rest of the line: "at <source> (<full path of source file>)"
    const endLine = stackLine.indexOf('(') - 1;
    return stackLine.substring(3, endLine);
  } else {
    // Unknown, therefore, return an empty string since any "default" value would be meaningless
    return '';
  }
}

/* istanbul ignore next - unnecessary to unit test */
/**
 * Reads and parses a JSON file from the specified file path.
 *
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {unknown} The parsed content of the JSON file.
 */
export function readJsonFile(filePath: string): unknown {
  assert.ok(filePath, 'filePath is required.');
  assert.ok(extname(filePath).toLowerCase() === '.json', `filePath does not have a '.json' extension.`);
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/* istanbul ignore next - unnecessary to unit test */
/**
 * Converts a given value into an `Error` object, providing contextual information about the source.
 *
 * @param {unknown} e - The value to be converted into an `Error`.
 * @param {string} source - The context or source of the error, used for generating descriptive messages.
 * @param {string} appVersion - The version of this application (${PKG_NAME}@${PKG_VERSION}).
 * @returns {Error} An `Error` object representing the given value, with contextual information.
 */
export function toError(e: unknown, source: string, appVersion: string): Error {
  const msgPrefix = `Error in ${source}/${appVersion}`;
  if (e instanceof Error) {
    e.message = `${msgPrefix}: ${e.message}`;
    return e;
  }

  if (typeof e === 'object' && e !== null && !Array.isArray(e)) {
    return new Error(`${msgPrefix}: ${JSON.stringify(e, null, 2)}`, { cause: e });
  }

  return new Error(`Unknown ${msgPrefix}`, { cause: e });
}
