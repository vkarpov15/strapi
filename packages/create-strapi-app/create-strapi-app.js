'use strict';

const commander = require('commander');
const generateNewApp = require('strapi-generate-new');
const promptUser = require('./utils/prompt-user');
const packageJson = require('./package.json');

const program = new commander.Command(packageJson.name);

let projectName;

program
  .version(packageJson.version)
  .arguments('[directory]')
  .option('--no-run', 'Do not start the application after it is created')
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
  .option('--template <templateurl>', 'Specify a Strapi template')
  .description('create a new application')
  .action(directory => {
    projectName = directory;
  })
  .parse(process.argv);

async function initProject(projectName, program) {
  const useQuickstart = program.quickstart !== undefined;

  const options = {};
  const prompt = await promptUser({ projectName, template: program.template, useQuickstart });
  projectName = prompt.directory || projectName;
  options.template = prompt.template || program.template;
  options.quickstart = prompt.quick || program.quickstart;

  if (program.quickstart && projectName === undefined) {
    console.error('Please specify the <directory> of your project when using --quickstart');

    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  const generateStrapiAppOptions = {
    ...program,
    ...options,
  };

  generateNewApp(projectName, generateStrapiAppOptions).then(() => {
    if (process.platform === 'win32') {
      process.exit(0);
    }
  });
}

initProject(projectName, program);
