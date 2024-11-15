const core = require('@actions/core');
const github = require('@actions/github');
const {promisify} = require('util');

const fs = require('fs');
const subprocesses = require('child_process');
const exec = promisify(subprocesses.exec)
const exists = promisify(fs.exists)
const read = promisify(fs.readFile)

const download = require('./download-horusec');
const upload = require('./upload-sarif');

async function run() {
    try{
        const executable = await download()
        const output = './result.sarif'
        try {
            await exec(`${executable} start --json-output-file="${output}" --output-format="sarif"`)
        } catch (err) {
            core.setFailed(err.message)
        }
    
        if (await exists(output)) {
            // You can parse your SARIF file here and maybe remove some false positives
            const raw = await read(output);
            const result = JSON.parse(raw);

            result.runs.forEach(run => {
                run.results = run.results.filter(result => {
                    return result.ruleId == 'XXXXX' || result.ruleId == 'YYYYY';
                });
            });

            //Save the modified SARIF file
            fs.writeFileSync(output, JSON.stringify(result));

            const uploadToGhas = core.getInput('upload-to-ghas');
            if (uploadToGhas) {
                // You can upload the SARIF file to GitHub Advanced Security here          
                upload.uploadSarif(github.context.repo.owner, github.context.repo.repo, output, 'Horusec Scan'); 
            }
            
            return result;
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()