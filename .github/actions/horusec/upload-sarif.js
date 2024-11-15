const github = require('@actions/github');
const fs = require("fs");

module.exports = async function(owner,repo,sarifFilePath,checkName) {
  try {
    // Initialize Octokit
    const token = core.getInput(`github-token`, {required: true});
    const {rest: {repos}} = github.getOctokit(token)

    // Validate SARIF file existence
    if (!fs.existsSync(sarifFilePath)) {
      throw new Error(`SARIF file not found: ${sarifFilePath}`);
    }

    // Read SARIF file content
    const sarifContent = fs.readFileSync(sarifFilePath, "utf8");

    // Get the default branch of the repository
    const { data: repoDetails } = await repos.get({
      owner,
      repo,
    });

    const defaultBranch = repoDetails.default_branch;

    // Upload the SARIF file
    const response = await octokit.codeScanning.uploadSarif({
      owner,
      repo,
      ref: `refs/heads/${defaultBranch}`, // Reference to the default branch
      sarif: sarifContent,
      commit_sha: repoDetails.pushed_at, // Latest commit SHA
      tool_name: checkName, // Tool name for the check run
    });

    console.log("SARIF file uploaded successfully:", response.data);
  } catch (error) {
    console.error("Error uploading SARIF file:", error.message);
  }
}

