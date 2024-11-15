const github = require('@actions/github');
const core = require('@actions/core');
const fs = require("fs");

module.exports = async function(githubContext, sarifFilePath,tool_name) {
  try {
    // Initialize Octokit
    const token = core.getInput(`GITHUB_TOKEN`, {required: true});
    const {rest: {codeScanning}} = github.getOctokit(token)

    // Validate SARIF file existence
    if (!fs.existsSync(sarifFilePath)) {
      throw new Error(`SARIF file not found: ${sarifFilePath}`);
    }

    // Read SARIF file content
    const sarif = fs.readFileSync(sarifFilePath, "utf8");

    // Upload the SARIF file
    const response = await codeScanning.uploadSarif({
      owner: githubContext.repo.owner,
      repo: githubContext.repo.repo,
      ref: githubContext.ref,
      sarif,
      commit_sha: githubContext.sha,
      tool_name
    });

    console.log("SARIF file uploaded successfully:", response.data);
  } catch (error) {
    console.error("Error uploading SARIF file:", error.message);
  }
}

