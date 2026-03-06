import { CliOptions, ICalGeneratorApp } from '../src/app';

describe('ICalGeneratorApp', () => {
  // NOTE: Tests for ICalGeneratorApp are integration tests in that the real processing is handled by:
  // (1) ical-generator.ts
  // (2) json-schema-validator.ts
  // These modules have a full implementation and are tested separately.

  const APP_VERSION = 'ical-gen-app@1.2.3';

  describe('constructor', () => {
    it('should initialize with valid CLI options', () => {
      const cliOptions: CliOptions = {
        appVersion: APP_VERSION,
        sourceFile: './test/samples/sample-ical-data.json',
        debug: true,
      };
      const app = new ICalGeneratorApp(cliOptions);
      expect(app).toBeInstanceOf(ICalGeneratorApp);
    });

    it('should throw when CliOptions not properly provided', () => {
      // @ts-expect-error: allow for testing
      expect(() => new ICalGeneratorApp(undefined)).toThrow(`cliOptions is required`);
      // @ts-expect-error: allow for testing
      expect(() => new ICalGeneratorApp(null)).toThrow(`cliOptions is required`);
      // @ts-expect-error: allow for testing
      expect(() => new ICalGeneratorApp({})).toThrow(`cliOptions is required`);
      // @ts-expect-error: allow for testing
      expect(() => new ICalGeneratorApp({ appVersion: 'appVersion' })).toThrow(`cliOptions.sourceFile is required`);
      // @ts-expect-error: allow for testing
      expect(() => new ICalGeneratorApp({ sourceFile: 'sourceFile' })).toThrow(`cliOptions.appVersion is required`);
    });
  });

  describe('generate', () => {
    it('should generate an iCalendar file from a JSON data file', () => {
      const cliOptions: CliOptions = {
        appVersion: APP_VERSION,
        sourceFile: './test/samples/sample-ical-data.json',
        debug: true,
      };
      const app = new ICalGeneratorApp(cliOptions);
      expect(app).toBeInstanceOf(ICalGeneratorApp);

      const status = app.generate();
      expect(status).toEqual(expect.stringContaining('Successfully generated the iCalendar file at'));
    });

    it('should fail to generate an iCalendar file from an invalid JSON data file', () => {
      const cliOptions: CliOptions = {
        appVersion: APP_VERSION,
        sourceFile: './test/testdata/invalid-ical-data.json',
        debug: true,
      };
      const app = new ICalGeneratorApp(cliOptions);
      expect(app).toBeInstanceOf(ICalGeneratorApp);

      const status = app.generate();
      expect(status).toEqual(
        expect.stringContaining('Failed to generate the iCalendar file due to invalid JSON data in'),
      );
      expect(status).toEqual(expect.stringContaining('Please correct the JSON data and try again.'));
    });
  });
});
