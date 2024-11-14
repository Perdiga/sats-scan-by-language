const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('GITHUB_TOKEN');
    const languagesToCheck = core.getInput('languages').split(',').map(lang => lang.trim());
    const octokit = github.getOctokit(token);

    // Fetch languages used in the repository
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    });

    console.log("Languages found in repository:", languages);

    // Track detection results
    let otherDetected = false;

    // Check each specified language and set output flags
    languagesToCheck.forEach(lang => {
      const detected = languages.hasOwnProperty(lang);
      core.setOutput(`${lang.toLowerCase()}-detected`, detected ? 'true' : 'false');
      
      console.log(`${lang} detected: ${detected ? 'Yes' : 'No'}`);
    });

    // Check for other languages
    Object.keys(languages).forEach(lang => {
      if (!languagesToCheck.includes(lang)) {
        otherDetected = true;
      }
    });

    // Set the other-detected output
    core.setOutput('other-detected', otherDetected ? 'true' : 'false');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();