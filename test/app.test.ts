import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { CliOptions, ICalGeneratorApp } from '../src/app';
import { ICAL_SCHEMA_PATH, ICalBaseData } from '../src/json-schema-validator';

jest.mock('node:fs');

describe('ICalGeneratorApp', () => {
  const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
  const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
  const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

  const appVersion = 'ical-gen-app@1.2.3';

  let icalGenSchema: string;
  beforeAll(async () => {
    // Read the schema here to avoid conflict with mockReadFileSync below
    icalGenSchema = await readFile(ICAL_SCHEMA_PATH, 'utf8');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid CLI options', () => {
      mockExistsSync.mockReturnValue(true);
      const cliOptions: CliOptions = { appVersion: appVersion, sourceFile: '~/sample.json', debug: true };
      const app = new ICalGeneratorApp(cliOptions);

      expect(app).toBeInstanceOf(ICalGeneratorApp);
    });

    it('should throw an error for missing CLI options', () => {
      // @ts-expect-error: allow for test
      expect(() => new ICalGeneratorApp()).toThrow('cliOptions is required');
      // @ts-expect-error: allow for test
      expect(() => new ICalGeneratorApp(undefined)).toThrow('cliOptions is required');
      // @ts-expect-error: allow for test
      expect(() => new ICalGeneratorApp(null)).toThrow('cliOptions is required');
    });

    it('should throw an error for invalid CLI options', () => {
      // @ts-expect-error: allow for test
      let cliOptions: CliOptions = { appVersion: appVersion, debug: false };
      expect(() => new ICalGeneratorApp(cliOptions)).toThrow('sourceFile is required');

      mockExistsSync.mockReturnValue(false);
      cliOptions = { appVersion: appVersion, sourceFile: '~/missing.json', debug: false };
      expect(() => new ICalGeneratorApp(cliOptions)).toThrow('sourceFile does not exist: ~/missing.json');
    });

    it("should throw an error if the file doesn't have a .json extension", () => {
      mockExistsSync.mockReturnValue(true);
      const cliOptions: CliOptions = { appVersion: appVersion, sourceFile: '~/example.txt' };

      expect(() => new ICalGeneratorApp(cliOptions)).toThrow(
        "sourceFile does not have a '.json' extension: example.txt",
      );
    });
  });

  describe('generate', () => {
    it('should successfully generate an iCalendar file', () => {
      mockExistsSync.mockReturnValue(true);

      const sourceFileName = '~/test/sample.json';
      const sourceData = {
        name: 'All-Day Event Calendar',
        events: [
          {
            allDayStart: '2026-02-24',
            summary: 'All-Day Test Event',
          },
        ],
      } as ICalBaseData;
      // generate() first call is for source data
      mockReadFileSync.mockReturnValueOnce(JSON.stringify(sourceData));
      // generate() second call is for the schema
      mockReadFileSync.mockReturnValueOnce(icalGenSchema);

      const cliOptions: CliOptions = { appVersion: appVersion, sourceFile: sourceFileName };
      const app = new ICalGeneratorApp(cliOptions);

      const message = app.generate();

      expect(mockReadFileSync).toHaveBeenCalledWith(sourceFileName, 'utf8');

      const writeFileName = sourceFileName.replace('.json', '.ics');
      expect(mockWriteFileSync).toHaveBeenCalledWith(writeFileName, expect.any(String));

      expect(message.trim()).toContain(`Successfully generated the iCalendar file at ${writeFileName}`);
    });

    it('should return a validation failure message for invalid JSON', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ invalid: 'data' }));

      const cliOptions: CliOptions = { appVersion: appVersion, sourceFile: 'invalid.json' };
      const app = new ICalGeneratorApp(cliOptions);

      const message = app.generate();

      expect(message).toContain('Failed to generate the iCalendar file due to invalid JSON data');
    });

    it('should throw an error on unexpected failures', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      const cliOptions: CliOptions = { appVersion: appVersion, sourceFile: 'corrupt.json' };
      const app = new ICalGeneratorApp(cliOptions);

      expect(() => app.generate()).toThrow('Unexpected failure');
    });
  });
});
