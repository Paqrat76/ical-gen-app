import { strict as assert } from 'node:assert';
import { writeFileSync } from 'node:fs';
import { ErrorObject } from 'ajv';
import { ICalCalendar } from 'ical-generator';
import { getDebugSource, OS_EOL, readJsonFile, toError, verifyJsonFilePath } from './utils';
import { ICalBaseData, ICalValidationResult, validateICalendarJson } from './json-schema-validator';
import { generateICalendarObject } from './ical-generator';

/**
 * Represents the options that can be passed to a CLI tool.
 *
 * @interface CliOptions
 *
 * @property {string} sourceFile - The path to the source file that the CLI tool will process.
 * @property {boolean} [debug] - Optional flag to enable debug mode for additional logging or diagnostics.
 */
export interface CliOptions {
  sourceFile: string;
  debug?: boolean;
  appVersion: string;
}
export type UserCliOptions = Omit<CliOptions, 'appVersion'>;

/**
 * The `ICalGeneratorApp` class is responsible for converting a JSON data file into an iCalendar
 * `.ics` file. It validates the input data, generates the iCalendar content, and writes
 * the resulting file to the specified output location.
 *
 * This class automatically derives the output file name by replacing the `.json` extension
 * in the source file name with `.ics`.
 *
 * It also provides optional debugging capabilities to log intermediate steps and data
 * during execution.
 *
 * The typical workflow involves constructing the class with a set of command-line
 * options, validating the CLI arguments, performing data conversion, and writing the
 * results to disk.
 */
export class ICalGeneratorApp {
  private static readonly REGEX_JSON_EXT = /\.json$/i;
  private static readonly TARGET_EXT = '.ics';

  private readonly debugEnabled: boolean;
  private readonly sourceFile: string;
  private readonly outputFile: string;
  private readonly appVersion: string;

  /**
   * Constructs an instance of the application with the given CLI options.
   *
   * @param {CliOptions} cliOptions - The options provided through the command-line interface. Must include:
   *   - `sourceFile`: The file path to the source JSON file. It will be validated.
   *   - `debug` (optional): A boolean indicating whether debug mode is enabled. Defaults to `false`.
   *   - `appVersion`: The version of the application.
   * @returns {ICalGeneratorApp} An instance of the ICalGeneratorApp class.
   */
  constructor(cliOptions: CliOptions) {
    assert.ok(cliOptions, 'cliOptions is required');
    assert.ok(JSON.stringify(cliOptions) !== '{}', 'cliOptions is required');
    assert.ok(cliOptions.sourceFile, 'cliOptions.sourceFile is required');
    assert.ok(cliOptions.appVersion, 'cliOptions.appVersion is required');

    this.sourceFile = verifyJsonFilePath('sourceFile', cliOptions.sourceFile);
    this.outputFile = this.sourceFile.replace(ICalGeneratorApp.REGEX_JSON_EXT, ICalGeneratorApp.TARGET_EXT);
    this.debugEnabled = cliOptions.debug ?? false;
    this.appVersion = cliOptions.appVersion;

    this.logDebug(this.appVersion, `cliOptions:${OS_EOL}${JSON.stringify(cliOptions, null, 2)}`);
  }

  /**
   * Generates an iCalendar (.ics) file based on the provided source file's JSON content.
   * Validates the source JSON structure, builds an iCalendar representation, and writes it to the specified output file.
   * Logs debug information and handles errors during the process.
   *
   * @returns {string} A message indicating the successful generation of the iCalendar file, or a validation failure message if the input is invalid.
   */
  public generate(): string {
    try {
      const sourceJson: unknown = readJsonFile(this.sourceFile);

      const validationFailureMessage = this.validateOrReturnMessage(this.sourceFile, sourceJson);
      if (validationFailureMessage) return validationFailureMessage;

      const icalCalendarString = this.buildICalendar(sourceJson).toString();
      this.logDebug(this.appVersion, icalCalendarString);

      writeFileSync(this.outputFile, icalCalendarString);

      return `Successfully generated the iCalendar file at ${this.outputFile}${OS_EOL}`;
    } catch (e) {
      /* istanbul ignore next */
      throw toError(e, 'ICalGeneratorApp.generate()', this.appVersion);
    }
  }

  private validateOrReturnMessage(dataFile: string, json: unknown): string | null {
    const validationResults: ICalValidationResult = validateICalendarJson(json);
    if (validationResults.isValid) {
      this.logDebug(this.appVersion, `JSON data file '${dataFile}' is valid.${OS_EOL}`);
      return null;
    }

    this.logValidationErrors(this.appVersion, dataFile, validationResults.errors);
    return `Failed to generate the iCalendar file due to invalid JSON data in '${dataFile}'.${OS_EOL}Please correct the JSON data and try again.${OS_EOL}`;
  }

  private buildICalendar(sourceJson: unknown): ICalCalendar {
    // Because validation passed before calling this, we can safely cast to ICalBaseData
    return generateICalendarObject(sourceJson as ICalBaseData);
  }

  private logValidationErrors(appVersion: string, dataFile: string, errors: ErrorObject[] | null | undefined): void {
    /* istanbul ignore else */
    if (errors) {
      console.error(
        `JSON schema validation errors in '${dataFile}/${appVersion}:${OS_EOL}${JSON.stringify(errors, null, 2)}'`,
      );
    }
  }

  private logDebug(appVersion: string, message: string): void {
    /* istanbul ignore else */
    if (this.debugEnabled) {
      console.log(`${OS_EOL}DEBUG:: ${appVersion}/${getDebugSource()} - ${OS_EOL}${message}`);
    }
  }
}
