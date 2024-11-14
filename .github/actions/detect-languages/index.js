const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    // Fetch languages used in the repository
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    });

    console.log("Languages found in repository:", languages);

    core.setOutput('should-run-codeql', 'false');
    core.setOutput('should-run-trivy', 'false');

    // Check if Java or JavaScript or Python is detected
    if (languages.hasOwnProperty('Java') || 
        languages.hasOwnProperty('Kotlin') ||
        languages.hasOwnProperty('JavaScript') ||
        languages.hasOwnProperty('TypeScript') ||
        languages.hasOwnProperty('Python') ||
        languages.hasOwnProperty('Csharp') ) {
        core.setOutput('should-run-codeql', 'true');
    } 
    
    if (languages.hasOwnProperty('Python')) {
        core.setOutput('should-run-trivy', 'true');
    }

    // Set the output variable based on detected language
    

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();