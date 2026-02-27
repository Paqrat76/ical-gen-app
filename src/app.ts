import { strict as assert } from 'node:assert';
import { existsSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { ErrorObject } from 'ajv';
import { ICalCalendar } from 'ical-generator';
import { OS_EOL, getDebugSource, readJsonFile, toError } from './utils';
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
  private static readonly SOURCE_EXT = '.json';
  private static readonly TARGET_EXT = '.ics';

  private readonly debugEnabled: boolean;
  private readonly sourceFile: string;
  private readonly outputFile: string;
  private readonly appVersion: string;

  /**
   * Constructor for the ICalGeneratorApp class.
   *
   * @param {CliOptions} cliOptions - The command-line options used for initializing the instance.
   * @returns {ICalGeneratorApp} An instance of the ICalGeneratorApp class.
   */
  constructor(cliOptions: CliOptions) {
    this.assertValidCliOptions(cliOptions);

    this.sourceFile = cliOptions.sourceFile;
    this.outputFile = cliOptions.sourceFile.replace(ICalGeneratorApp.SOURCE_EXT, ICalGeneratorApp.TARGET_EXT);
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
      throw toError(e, 'ICalGeneratorApp.generate()', this.appVersion);
    }
  }

  private assertValidCliOptions(cliOptions: CliOptions): void {
    assert.ok(cliOptions, 'cliOptions is required');
    assert.ok(cliOptions.sourceFile, 'sourceFile is required');
    assert.ok(existsSync(cliOptions.sourceFile), `sourceFile does not exist: ${cliOptions.sourceFile}`);

    const ext = path.extname(cliOptions.sourceFile).toLowerCase();
    assert.ok(
      ext === ICalGeneratorApp.SOURCE_EXT,
      `sourceFile does not have a '${ICalGeneratorApp.SOURCE_EXT}' extension: ${path.posix.basename(cliOptions.sourceFile)}`,
    );
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
    if (errors) {
      console.error(
        `JSON schema validation errors in '${dataFile}/${appVersion}:${OS_EOL}${JSON.stringify(errors, null, 2)}'`,
      );
    }
  }

  private logDebug(appVersion: string, message: string): void {
    if (this.debugEnabled) {
      console.log(`${OS_EOL}DEBUG::${getDebugSource()}/${appVersion} - ${OS_EOL}${message}`);
    }
  }
}
