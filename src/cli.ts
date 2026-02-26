#!/usr/bin/env node

import os from 'node:os';
import { Command } from '@commander-js/extra-typings';
import { textSync } from 'figlet';
import { cyan, red } from 'kleur';
import { CliOptions, ICalGeneratorApp } from './app';
import { toError } from './utils';

import * as pkgJson from '../package.json';

const CLI_NAME = 'icalGenerator';
const PKG_NAME: string = pkgJson.name;
const PKG_DESCRIPTION: string = pkgJson.description;
const PKG_VERSION: string = pkgJson.version;
const OS_EOL = os.EOL;

/**
 * Main CLI function
 *
 * References:
 *  - Commander.js
 *      https://www.npmjs.com/package/commander?activeTab=readme
 *  - Node.js CLI Apps Best Practices
 *      https://github.com/lirantal/nodejs-cli-apps-best-practices
 */
function main(): string {
  console.log(cyan(textSync(CLI_NAME)));

  // Initialize the CliCommand object and pass it into the buildCommandInstance. The processCommand() function will
  // populate the results from the selected command when program.parse() processes the selected command. The returned
  // CliCommand object is passed into the ICalGeneratorApp constructor to enable processing the selected command.
  const icalGenOptions: CliOptions = {
    sourceFile: 'TBD',
    debug: false,
  };

  try {
    // Define CLI application
    let program: Command = createCliCommand();

    // Define the generate command and add it to the CLI application
    program = buildCommandInstance(
      program,
      'Generate an iCalendar file from a JSON data file.',
      'Generates the ".ics" file in the same directory as the JSON data file with the same basename. The JSON data file must conform to the iCalendar schema.',
      icalGenOptions,
    );

    // Default program.parse() is required for commander.js to process the selected command.
    // The action handler in processCommand() updates the 'icalGenCommand: CliCommand'
    // object containing the command name and options required by processing below.
    // We use the icalGenCommand object to track the chosen command.
    program.parse();

    console.log(cyan(`${OS_EOL}***** Beginning iCalendar generation for '${icalGenOptions.sourceFile}'...${OS_EOL}`));

    // NOTE: The 'app' methods below will throw an Error if warranted and will be caught by the main() method's catch.
    const app = new ICalGeneratorApp(icalGenOptions);
    const status = app.generate();

    console.log(cyan(`${OS_EOL}***** ${status}`));
    process.exit(0);
  } catch (e) {
    const error: Error = toError(e, CLI_NAME);

    const errStack = error.stack ?? '';
    console.error(red(`${OS_EOL}***** Error: ${error.message}${OS_EOL}${errStack}`));
    process.exit(1);
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
    .allowExcessArguments(false)
    .showHelpAfterError(red('(use the --help option for additional information)'))
    .configureHelp({
      showGlobalOptions: true,
      helpWidth: 80,
    })
    .addHelpText('beforeAll', cyan(`${PKG_NAME}@${PKG_VERSION}${OS_EOL}`))
    .addHelpText('afterAll', ` `)
    .configureOutput({
      // Highlight errors in color.
      outputError: (str, write) => {
        write(errorColor(str));
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
    // DO NOT place defaulted "requiredOptions" first!
    // Doing so will result in the defaulted "requiredOptions" being excluded in the help.
    .requiredOption('-s, --sourceFile <sourceFile>', '(REQUIRED) local path to the source JSON file to be processed')
    .option('-d, --debug', 'output extra debugging info')
    .action((options: CliOptions) => {
      try {
        // function populates icalGenOptions for use in executing the iCalendar generator
        processCommand(options, icalGenOptions);
      } catch (e) {
        if (e instanceof Error) {
          program.error(e.message);
        }
      }
    });

  return program;
}

/**
 * Processes a command by configuring options for generating iCalendar files.
 *
 * @param {CliOptions} options - The command line options provided by the user.
 * @param {CliOptions} icalGenOptions - The options to be used for iCalendar generation, modified based on the input options.
 * @returns {void} This method does not return a value.
 */
function processCommand(options: CliOptions, icalGenOptions: CliOptions): void {
  icalGenOptions.sourceFile = options.sourceFile;
  icalGenOptions.debug = options.debug ?? false;

  console.log(cyan(`Executed with options ${JSON.stringify(icalGenOptions)}${OS_EOL}`));
}

/**
 * Applies ANSI escape codes to style the given string in red, typically used to indicate errors.
 *
 * @param {string} str - The string message to be styled.
 * @returns {string} The input string wrapped with ANSI escape codes for red color formatting.
 */
function errorColor(str: string): string {
  // Add ANSI escape codes to display text in red.
  return `\x1b[31m${str}\x1b[0m`;
}
