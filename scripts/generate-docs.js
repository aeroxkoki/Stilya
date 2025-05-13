#!/usr/bin/env node

/**
 * This script generates JSDoc documentation for the Stilya project
 * It scans the src directory for TypeScript files and generates HTML documentation
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  source: './src',
  output: './docs/generated',
  configFile: './jsdoc.config.json',
  readme: './docs/README.md',
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.output)) {
  fs.mkdirSync(config.output, { recursive: true });
}

// Create JSDoc configuration file if it doesn't exist
if (!fs.existsSync(config.configFile)) {
  const jsdocConfig = {
    plugins: ['plugins/markdown', 'node_modules/better-docs/typescript'],
    source: {
      include: [config.source],
      includePattern: '\\.(jsx|js|ts|tsx)$',
      excludePattern: '(node_modules/|docs)'
    },
    templates: {
      cleverLinks: true,
      monospaceLinks: true
    },
    opts: {
      destination: config.output,
      recurse: true,
      readme: config.readme
    },
    markdown: {
      idInHeadings: true
    },
    typescript: {
      moduleRoot: 'src'
    }
  };

  fs.writeFileSync(
    config.configFile,
    JSON.stringify(jsdocConfig, null, 2),
    'utf8'
  );
  console.log(`Created JSDoc configuration file: ${config.configFile}`);
}

// Run JSDoc command
console.log('Generating JSDoc documentation...');
exec(`npx jsdoc -c ${config.configFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Documentation generated successfully at ${config.output}`);
  console.log(stdout);
});
