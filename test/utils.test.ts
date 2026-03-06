import os from 'node:os';
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, normalize, resolve } from 'node:path';
import { getDebugSource, readJsonFile, toError, verifyJsonFilePath } from '../src/utils';

describe('utils', () => {
  describe('getDebugSource', () => {
    function withMockedErrorStack<T>(stack: string | undefined, run: () => T): T {
      const OriginalError = globalThis.Error;

      class MockError {
        public stack: string | undefined;
        constructor() {
          this.stack = stack;
        }
      }

      // Swap the global Error constructor so `new Error().stack` is deterministic
      (globalThis as unknown as { Error: unknown }).Error = MockError as unknown;

      try {
        return run();
      } finally {
        (globalThis as unknown as { Error: unknown }).Error = OriginalError as unknown;
      }
    }

    it('returns empty string when Error.stack is undefined', () => {
      const result = withMockedErrorStack(undefined, () => getDebugSource());
      expect(result).toBe('');
    });

    it('returns empty string when Error.stack is empty', () => {
      const result = withMockedErrorStack('', () => getDebugSource());
      expect(result).toBe('');
    });

    it('returns empty string when stack has fewer than 4 lines', () => {
      const stack = ['Error:', 'at getDebugSource (file:1:1)', 'at Something.logDebug (file:2:2)'].join('\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('');
    });

    it('returns empty string when the 4th line is blank/whitespace', () => {
      const stack = ['Error:', 'at getDebugSource (file:1:1)', 'at Something.logDebug (file:2:2)', '   '].join('\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('');
    });

    it(`returns empty string when the 4th line does not match the expected 'at <fn> <location>' format`, () => {
      const stack = [
        'Error:',
        'at getDebugSource (file:1:1)',
        'at Something.logDebug (file:2:2)',
        'not a v8 stack line',
      ].join('\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('');
    });

    it('extracts the method name from the 4th stack line (index 3)', () => {
      const stack = [
        'Error:',
        'at getDebugSource (/path/utils.ts:10:5)',
        'at Something.logDebug (/path/app.ts:20:1)',
        'at callingMethod (/path/app.ts:30:9)',
        'at other (/path/other.ts:40:2)',
      ].join('\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('callingMethod');
    });

    it('handles Windows CRLF line endings', () => {
      const stack = [
        'Error:',
        'at getDebugSource (C:\\path\\utils.ts:10:5)',
        'at Something.logDebug (C:\\path\\app.ts:20:1)',
        'at callingMethod (C:\\path\\app.ts:30:9)',
      ].join('\r\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('callingMethod');
    });

    it('trims the stack line before parsing', () => {
      const stack = [
        'Error:',
        'at getDebugSource (/path/utils.ts:10:5)',
        'at Something.logDebug (/path/app.ts:20:1)',
        '   at callingMethod (/path/app.ts:30:9)   ',
      ].join('\n');

      const result = withMockedErrorStack(stack, () => getDebugSource());
      expect(result).toBe('callingMethod');
    });
  });

  describe('verifyJsonFilePath', () => {
    const testPropertyName = 'myFilePath';
    let tempDir: string;

    beforeEach(() => {
      tempDir = join(os.tmpdir(), `verify-json-file-path-${String(process.pid)}-${String(Date.now())}`);
      mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw when propertyName is empty or whitespace', () => {
      // @ts-expect-error: allow for testing
      expect(() => verifyJsonFilePath(undefined, 'filePath')).toThrow(`propertyName is required.`);
      // @ts-expect-error: allow for testing
      expect(() => verifyJsonFilePath(null, 'filePath')).toThrow(`propertyName is required.`);
      expect(() => verifyJsonFilePath('', 'filePath')).toThrow(`propertyName is required.`);
      expect(() => verifyJsonFilePath('   ', 'filePath')).toThrow(`propertyName is required.`);
    });

    it('should throw when filePath is empty or whitespace', () => {
      // @ts-expect-error: allow for testing
      expect(() => verifyJsonFilePath(testPropertyName, undefined)).toThrow(`${testPropertyName} is required.`);
      // @ts-expect-error: allow for testing
      expect(() => verifyJsonFilePath(testPropertyName, null)).toThrow(`${testPropertyName} is required.`);
      expect(() => verifyJsonFilePath(testPropertyName, '')).toThrow(`${testPropertyName} is required.`);
      expect(() => verifyJsonFilePath(testPropertyName, '   ')).toThrow(`${testPropertyName} is required.`);
    });

    it('should throw when filePath does not have a .json extension', () => {
      const txtFilePath = join(tempDir, 'data.txt');
      writeFileSync(txtFilePath, 'hello', 'utf8');

      expect(() => verifyJsonFilePath(testPropertyName, txtFilePath)).toThrow(
        `${testPropertyName} (${resolve(txtFilePath)}) does not have a '.json' extension.`,
      );
    });

    it('should accept an uppercase .JSON extension', () => {
      const jsonFilePath = join(tempDir, 'data.JSON');
      writeFileSync(jsonFilePath, '{"ok":true}', 'utf8');

      expect(verifyJsonFilePath(testPropertyName, jsonFilePath)).toBe(resolve(jsonFilePath));
    });

    it('should throw when the .json file does not exist', () => {
      const missingFilePath = join(tempDir, 'missing.json');

      expect(() => verifyJsonFilePath(testPropertyName, missingFilePath)).toThrow(
        `${testPropertyName} (${resolve(missingFilePath)}) does not exist.`,
      );
    });

    it('should throw when the path points to a directory', () => {
      const directoryPath = join(tempDir, 'folder.json');
      mkdirSync(directoryPath);

      expect(() => verifyJsonFilePath(testPropertyName, directoryPath)).toThrow(
        `${testPropertyName} (${resolve(directoryPath)}) is not a file.`,
      );
    });

    it('should return the normalized absolute path for a valid JSON file', () => {
      const nestedDir = join(tempDir, 'nested');
      mkdirSync(nestedDir);
      const jsonFilePath = join(nestedDir, 'valid.json');
      writeFileSync(jsonFilePath, '{"name":"test"}', 'utf8');

      const relativePath = join(tempDir, 'nested', '..', 'nested', 'valid.json');
      const expectedPath = resolve(normalize(relativePath));

      expect(verifyJsonFilePath(testPropertyName, relativePath)).toBe(expectedPath);
    });

    it('should return the normalized absolute path for a local valid JSON file', () => {
      const jsonFilePath = './test/samples/sample-ical-data.json';
      const expectedPath = resolve(normalize(jsonFilePath));

      expect(verifyJsonFilePath(testPropertyName, jsonFilePath)).toBe(expectedPath);
    });

    it('should trim surrounding whitespace before validating the path', () => {
      const jsonFilePath = join(tempDir, 'trimmed.json');
      writeFileSync(jsonFilePath, '{"trimmed":true}', 'utf8');

      expect(verifyJsonFilePath(testPropertyName, `   ${jsonFilePath}   `)).toBe(resolve(jsonFilePath));
    });

    it('should throw when the file is not readable', () => {
      const jsonFilePath = join(tempDir, 'unreadable.json');
      writeFileSync(jsonFilePath, '{"secret":true}', 'utf8');
      chmodSync(jsonFilePath, 0o000);

      try {
        expect(() => verifyJsonFilePath(testPropertyName, jsonFilePath)).toThrow(
          new RegExp(
            `^${testPropertyName} \\(${resolve(jsonFilePath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\) is not readable:`,
          ),
        );
      } finally {
        chmodSync(jsonFilePath, 0o644);
      }
    });
  });

  describe('readJsonFile', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = join(os.tmpdir(), `read-json-file-test-${String(process.pid)}-${String(Date.now())}`);
      mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw if the filePath is not a valid JSON file', () => {
      const nonJsonFilePath = join(tempDir, 'data.txt');
      writeFileSync(nonJsonFilePath, 'hello', 'utf8');

      expect(() => readJsonFile(nonJsonFilePath)).toThrow(
        `filePath (${resolve(nonJsonFilePath)}) does not have a '.json' extension.`,
      );
    });

    it('should throw if the JSON content is invalid', () => {
      const invalidJsonFilePath = join(tempDir, 'invalid.json');
      writeFileSync(invalidJsonFilePath, '{"key: invalid json}', 'utf8');

      expect(() => readJsonFile(invalidJsonFilePath)).toThrow(
        `Invalid JSON in file (${resolve(invalidJsonFilePath)}): Unterminated string in JSON at position 20 (line 1 column 21)`,
      );
    });

    it('should correctly parse valid JSON files', () => {
      const validJsonFilePath = join(tempDir, 'valid.json');
      const data = { key: 'value', nested: { number: 42 } };
      writeFileSync(validJsonFilePath, JSON.stringify(data), 'utf8');

      const result = readJsonFile(validJsonFilePath);
      expect(result).toEqual(data);
    });

    it('should handle paths with leading and trailing whitespaces', () => {
      const jsonFilePath = join(tempDir, 'whitespace.json');
      const data = { trimmed: true };
      writeFileSync(jsonFilePath, JSON.stringify(data), 'utf8');

      const result = readJsonFile(`  ${jsonFilePath}  `);
      expect(result).toEqual(data);
    });

    it('should throw if the file is unreadable', () => {
      const unreadableFilePath = join(tempDir, 'unreadable.json');
      writeFileSync(unreadableFilePath, '{"key":"value"}', 'utf8');
      chmodSync(unreadableFilePath, 0o000);

      try {
        expect(() => readJsonFile(unreadableFilePath)).toThrow(
          `filePath (${resolve(unreadableFilePath)}) is not readable: Error: EACCES: permission denied, access '${resolve(unreadableFilePath)}'`,
        );
      } finally {
        chmodSync(unreadableFilePath, 0o644);
      }
    });
  });

  describe('toError() error formatting (covers private describeUnknownError)', () => {
    const appVersion = 'ical-gen-app@1.2.3-test';
    const source = 'unit-test';

    it('should preserve the Error input', () => {
      const input = new Error('Original error message');

      const err = toError(input, source, appVersion);

      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(input);
      // This path should not go through describeUnknownError; it uses e.message directly.
      expect(err.message).toContain(`Error in ${appVersion}/${source}: Original error message`);
    });

    it('should properly handle standard primitives', () => {
      const stringValue = 'string value';
      let err = toError(stringValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(stringValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(stringValue);

      const numberValue = 123;
      err = toError(numberValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(numberValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(numberValue));

      const booleanValue = false;
      err = toError(booleanValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(booleanValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(booleanValue));

      const bigintValue = 123n;
      err = toError(bigintValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(bigintValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(bigintValue));

      const symbolValue = Symbol('symbolTest');
      err = toError(symbolValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(symbolValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(symbolValue));

      const functionValue = (a: number, b: number): number => {
        return a + b + 3;
      };
      err = toError(functionValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(functionValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(`[function functionValue]`);

      const nullValue = null;
      err = toError(nullValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(nullValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(nullValue));

      const undefinedValue = undefined;
      err = toError(undefinedValue, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(undefinedValue);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain(String(undefinedValue));
    });

    it('should properly handle circular objects', () => {
      const obj: { a: number; self?: unknown } = { a: 1 };
      obj.self = obj;

      const err = toError(obj, source, appVersion);

      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBe(obj);
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message).toContain('[Circular *1]');
      expect(err.message).toContain('a: 1');
    });

    it('should properly handle BigInt in object', () => {
      const obj = { count: 1n };

      const err = toError(obj, source, appVersion);

      expect(err.cause).toBe(obj);
      expect(err.message).toContain('count: 1n');
    });

    it('should properly handle Map/Set', () => {
      const obj = {
        map: new Map<string, number>([['a', 1]]),
        set: new Set<number>([1, 2]),
      };

      const err = toError(obj, source, appVersion);

      // Keep assertions resilient across Node formatting differences
      expect(err.message).toMatch(/Map\(\s*1\s*\)/);
      expect(err.message).toContain("'a'");
      expect(err.message).toContain('1');

      expect(err.message).toMatch(/Set\(\s*2\s*\)/);
      expect(err.message).toContain('1');
      expect(err.message).toContain('2');
    });

    it('should truncate very large output', () => {
      const tooBig = { data: 'x'.repeat(50_000) };

      const err = toError(tooBig, source, appVersion);
      expect(err).toBeInstanceOf(Error);
      expect(err.cause).toBeDefined();
      expect(err.message).toContain(`Error in ${appVersion}/${source}:`);
      expect(err.message.endsWith('<truncated>')).toBe(true);
    });
  });
});
