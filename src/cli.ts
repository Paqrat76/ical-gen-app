#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import { textSync } from 'figlet';
import { cyan, red } from 'kleur';
import { CliOptions, ICalGeneratorApp } from './app';
import { toError, OS_EOL } from './utils';

import * as pkgJson from '../package.json';

const CLI_NAME = 'icalGenerator';
const PKG_NAME: string = pkgJson.name;
const PKG_DESCRIPTION: string = pkgJson.description;
const PKG_VERSION: string = pkgJson.version;
const APP_VERSION = `${PKG_NAME}@${PKG_VERSION}`;

/**
 * Main CLI function
 *
 * Main function that serves as the entry point for the CLI application. It performs the following steps:
 * 1. Displays the CLI application name.
 * 2. Initializes CLI options.
 * 3. Constructs the CLI commands and parses input arguments using the commander.js library.
 * 4. Validates the selected options and, if valid, invokes the iCalendar generation process.
 * 5. Handles errors during the iCalendar generation process and displays appropriate error messages.
 *
 * References:
 *  - Commander.js
 *     https://www.npmjs.com/package/commander?activeTab=readme
 *  - Node.js CLI Apps Best Practices
 *     https://github.com/lirantal/nodejs-cli-apps-best-practices
 *
 * @returns {void} Does not return a value as it executes the CLI application logic and outputs results directly to the console.
 */
function main(): void {
  console.log(cyan(textSync(CLI_NAME)));

  // Initialize the CliOptions object and pass it into the buildCommandInstance which will populate the results from
  // the selected command when program.parse() is executed. The returned CliOptions object is passed into the
  // ICalGeneratorApp constructor.
  const icalGenOptions: CliOptions = {
    sourceFile: '',
    debug: false,
    appVersion: APP_VERSION,
  };

  // Define CLI application
  let program: Command = createCliCommand();

  // Define the generate command and add it to the CLI application
  program = buildCommandInstance(
    program,
    'Generate an iCalendar file from a JSON data file.',
    'Generates the ".ics" file in the same directory as the JSON data file with the same basename. The JSON data file must conform to the iCalendar schema.',
    icalGenOptions,
  );

  //program.parse() is required for commander.js to process the selected command.
  program.parse(process.argv);

  // program.opts() returns an object containing the option values as key-value pairs that were selected by the user.
  const options = program.opts();
  const sourceFileSelected = 'sourceFile' in options;
  if (sourceFileSelected && icalGenOptions.sourceFile.length > 0) {
    // The sourceFile option was selected and populated, so execute the generation app.
    // The ICalGeneratorApp constructor will validate the sourceFile option and throw an error if it is invalid.
    try {
      console.log(cyan(`${OS_EOL}***** Beginning iCalendar generation for '${icalGenOptions.sourceFile}'...${OS_EOL}`));

      const app = new ICalGeneratorApp(icalGenOptions);
      const status = app.generate();

      console.log(cyan(`${OS_EOL}***** ${status}`));
    } catch (e) {
      const error: Error = toError(e, CLI_NAME, APP_VERSION);
      const errStack = error.stack ?? '';
      console.error(red(`${OS_EOL}***** Error: ${error.message}${OS_EOL}${errStack}`));
      process.exitCode = 1;
    }
  }
}

main();

// ----------------------------------------------------------------------------

/**
 * Creates and configures a CLI command using the Command module.
 *
 * The returned Command instance is configured with the application name, description,
 * version, error handling, and custom help text formatting.
 *
 * @returns {Command} A configured instance of Command for CLI interaction.
 */
function createCliCommand(): Command {
  const program = new Command();

  program
    .name(CLI_NAME)
    .description(PKG_DESCRIPTION)
    .version(PKG_VERSION)
    .showHelpAfterError(red('(use the --help option for additional information)'))
    .configureHelp({
      showGlobalOptions: true,
      helpWidth: 80,
    })
    .addHelpText('beforeAll', cyan(`${APP_VERSION}${OS_EOL}`))
    // TODO: Add link(s) to documentation once it has been created and published.
    .addHelpText('afterAll', cyan(`${OS_EOL}Add link to documentation here...${OS_EOL}`))
    .configureOutput({
      // Highlight errors in color.
      outputError: (str, write) => {
        write(red(str));
      },
    });

  return program;
}

/**
 * Configures a Command instance with the provided summary, description, and options.
 *
 * @param {Command} program - The Command instance to be configured.
 * @param {string} summary - A brief summary of the command's purpose.
 * @param {string} description - A detailed description of the command's functionality.
 * @param {CliOptions} icalGenOptions - The options instance to be populated for executing the iCalendar generator.
 * @returns {Command} The configured Command instance.
 */
function buildCommandInstance(
  program: Command,
  summary: string,
  description: string,
  icalGenOptions: CliOptions,
): Command {
  program
    .summary(summary)
    .description(description)
    .requiredOption('-s, --sourceFile <sourceFile>', '(REQUIRED) local path to the source JSON file to be processed')
    .option('-d, --debug', 'output extra debugging info')
    .action((options) => {
      icalGenOptions.sourceFile = options.sourceFile;
      icalGenOptions.debug = options.debug ?? false;
      console.log(cyan(`Executed with options ${JSON.stringify(icalGenOptions)}${OS_EOL}`));
    });

  return program;
}
