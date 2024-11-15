const core = require('@actions/core');
const github = require('@actions/github');
const {promisify} = require('util');

const fs = require('fs');
const exists = promisify(fs.exists)
const read = promisify(fs.readFile)
const copyFile = promisify(fs.copyFile)

const download = require('./download-horusec');
const upload = require('./upload-sarif');
const horusec = require('./horusec');

async function run() {
    try{
        const executable = await download()
        const output = './result.sarif'
        try {
            await copyFile(".github/actions/horusec/horusec-config.json", "./horusec-config.json", fs.constants.COPYFILE_EXCL);
            await horusec(executable, output);
        } catch (err) {
            core.setFailed(err.message)
        }
    
        if (await exists(output)) {
            // You can parse your SARIF file here and maybe remove some false positives
            const raw = await read(output);
            var result = JSON.parse(raw);

            //const issues = ['HS-LEAKS-25'];
            const issues = ['XXXXX'];
            result.runs.forEach(run => {
                run.results = run.results.filter(result => {
                    return !issues.includes(result.ruleId);
                });
            });

            //Save the modified SARIF file
            fs.writeFileSync(output, JSON.stringify(result));

            const uploadToGhas = core.getInput('upload-to-ghas');
            if (uploadToGhas) {
                // You can upload the SARIF file to GitHub Advanced Security here          
                await upload(github.context , output, 'Horusec Scan'); 
            }
            
            return result;
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
