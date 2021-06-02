'use strict';

const inquirer = require('inquirer');
const axios = require('axios');
const yaml = require('js-yaml');

/**
 * @param {Object} projectArgs - The arguments needed to create a project
 * @param {string|null} projectArgs.projectName - The name/path of project
 * @param {string|null} projectArgs.starterUrl - The GitHub repo of the starter
 * @param {boolean} projectArgs.useQuickstart - Check quickstart flag was set
 * @returns
 */
module.exports = async function promptUser(projectArgs) {
  const questions = await getPromptQuestions(projectArgs);
  return inquirer.prompt(questions);
};

/**
 *
 * @returns Prompt question object
 */
async function getStarterQuestion() {
  const content = await getStarterData();

  // Fallback to manual input when fetch fails
  if (!content) {
    return {
      type: 'input',
      message: 'Please provide the GitHub URL for the starter you would like to use:',
    };
  }

  const options = content.map(option => {
    const name = option.title.replace('Starter', '');

    return {
      name,
      value: `https://github.com/${option.repo}`,
    };
  });

  return {
    type: 'list',
    message:
      'Which starter would you like to use? (Starters are fullstack Strapi applications designed for a specific use case)',
    pageSize: options.length,
    choices: options,
  };
}

/**
 *
 * @param {Object} projectArgs - The arguments needed to create a project
 * @returns Array of prompt question objects
 */
async function getPromptQuestions(projectArgs) {
  const { projectName, starterUrl, useQuickstart } = projectArgs;
  const starterQuestion = await getStarterQuestion();

  return [
    {
      type: 'input',
      default: projectName || 'my-strapi-project',
      name: 'directory',
      message: 'What would you like to name your project?',
      when: !projectName,
    },
    {
      name: 'starter',
      when: !starterUrl,
      ...starterQuestion,
    },
    {
      type: 'list',
      name: 'quick',
      message: 'Choose your installation type',
      choices: [
        {
          name: 'Quickstart (recommended)',
          value: true,
        },
        {
          name: 'Custom (manual settings)',
          value: false,
        },
      ],
      when: !useQuickstart,
    },
  ];
}

async function getStarterData() {
  try {
    const {
      data: { content },
    } = await axios.get(
      `https://api.github.com/repos/strapi/community-content/contents/starters/starters.yml`
    );
    const buff = Buffer.from(content, 'base64');
    const stringified = buff.toString('utf-8');

    return yaml.load(stringified);
  } catch (error) {
    return null;
  }
}
