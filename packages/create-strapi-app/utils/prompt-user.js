'use strict';

const inquirer = require('inquirer');
const axios = require('axios');
const yaml = require('js-yaml');

/**
 * @param {string|null} projectName - The name/path of project
 * @param {string|null} template - The Github repo of the template
 * @returns Object containting prompt answers
 */
module.exports = async function promptUser(projectName, template) {
  const questions = await getPromptQuestions(projectName, template);
  return inquirer.prompt(questions);
};

/**
 *
 * @returns Prompt question object
 */
async function getTemplateQuestion() {
  const content = await getTemplateData(`templates/templates.yml`);

  // Fallback to manual input when fetch fails
  if (!content) {
    return {
      type: 'input',
      message: 'Please provide the GitHub URL for your template:',
    };
  }

  const choices = content.map(option => {
    const name = option.title.replace('Template', '');
    return {
      name,
      value: `https://github.com/${option.repo}`,
    };
  });

  return {
    type: 'list',
    message: `Select a template`,
    pageSize: choices.length,
    choices,
  };
}

/**
 *
 * @returns Array of prompt question objects
 */
async function getPromptQuestions(projectName, template) {
  const templateQuestion = await getTemplateQuestion();

  return [
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
    },
    {
      type: 'input',
      default: 'my-strapi-project',
      name: 'directory',
      when: !projectName,
      message: 'What would you like to name your project?',
    },
    {
      type: 'confirm',
      name: 'useTemplate',
      when: !template,
      message:
        'Would you like to use a template? (Templates are Strapi configurations designed for a specifc use case)',
    },
    {
      name: 'template',
      when(answers) {
        return answers.useTemplate;
      },
      ...templateQuestion,
    },
  ];
}

/**
 *
 * @returns JSON template data
 */
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
