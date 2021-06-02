'use strict';

const inquirer = require('inquirer');
const axios = require('axios');
const yaml = require('js-yaml');

/**
 * @param {Object} projectArgs - The arguments needed to create a project
 * @param {string|null} projectArgs.projectName - The name/path of project
 * @param {string|null} projectArgs.template - The Github repo of the template
 * @param {boolean} projectArgs.useQuickstart - Check quickstart flag was set
 * @param {string} cliType - The type of cli: starters or templates
 * @returns
 */
module.exports = async function promptUser(projectArgs) {
  const questions = await getPromptQuestions(projectArgs);
  return inquirer.prompt(questions);
};

async function getTemplateQuestion() {
  const content = await getTemplateData(`templates/templates.yml`);

  // Fallback to manual input when fetch fails
  if (!content) {
    return {
      type: 'input',
      message: 'Please provide the GitHub URL for your starter:',
    };
  }

  const options = content.map(option => {
    const name = option.title.replace('Template', '');
    return {
      name,
      value: `https://github.com/${option.repo}`,
    };
  });

  const separator = new inquirer.Separator();
  const choices = [{ name: 'None', value: null }, separator, ...options];

  return {
    type: 'list',
    message: `Would you like to use a template? (Templates are Strapi configurations designed for a specifc use case)`,
    pageSize: choices.length,
    choices,
  };
}

async function getPromptQuestions(projectArgs) {
  const { projectName, template, useQuickstart } = projectArgs;
  const templateQuestion = await getTemplateQuestion();

  return [
    {
      type: 'input',
      default: 'my-strapi-project',
      name: 'directory',
      message: 'What would you like to name your project?',
      when: !projectName,
    },
    {
      name: 'template',
      when: !template,
      ...templateQuestion,
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

async function getTemplateData() {
  try {
    const {
      data: { content },
    } = await axios.get(
      `https://api.github.com/repos/strapi/community-content/contents/templates/templates.yml`
    );

    const buff = Buffer.from(content, 'base64');
    const stringified = buff.toString('utf-8');

    return yaml.load(stringified);
  } catch (error) {
    return null;
  }
}
