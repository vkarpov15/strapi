'use strict';

const commander = require('commander');

const packageJson = require('./package.json');
const buildStarter = require('./utils/build-starter');

const program = new commander.Command(packageJson.name);

program
  .version(packageJson.version)
  .arguments('[directory], [starterurl]')
  .option('--use-npm', 'Force usage of npm instead of yarn to create the project')
  .option('--debug', 'Display database connection error')
  .option('--quickstart', 'Quickstart app creation')
  .option('--dbclient <dbclient>', 'Database client')
  .option('--dbhost <dbhost>', 'Database host')
  .option('--dbsrv <dbsrv>', 'Database srv')
  .option('--dbport <dbport>', 'Database port')
  .option('--dbname <dbname>', 'Database name')
  .option('--dbusername <dbusername>', 'Database username')
  .option('--dbpassword <dbpassword>', 'Database password')
  .option('--dbssl <dbssl>', 'Database SSL')
  .option('--dbauth <dbauth>', 'Authentication Database')
  .option('--dbfile <dbfile>', 'Database file path for sqlite')
  .option('--dbforce', 'Overwrite database content if any')
  .description(
    'Create a fullstack monorepo application using the strapi backend template specified in the provided starter'
  )
  .action((directory, starterUrl, programArgs) => {
    const projectArgs = { projectName: directory, starterUrl };

    if (programArgs.quickstart && (directory === undefined || starterUrl == undefined)) {
      console.error(
        'Please specify the <directory> and <starterurl> of your project when using --quickstart'
      );

      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }

    buildStarter(projectArgs, programArgs).catch(error => {
      console.error(error.message);
      process.exit(1);
    });
  });

try {
  program.parse(process.argv);
} catch (err) {
  if (err.exitCode && err.exitCode != 0) {
    program.outputHelp();
  }
}
