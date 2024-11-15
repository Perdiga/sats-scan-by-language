const { spawn } = require('child_process');

module.exports = async function(executable, output) {
    return new Promise((resolve, reject) => {
        const args = [
            'start',
            "-p",
            ".",
            "-D",
            `--json-output-file=${output}`,
            '--output-format=sarif',
        ];

        const subprocess = spawn(executable, args, { shell: true });

        // Log standard output in real-time
        subprocess.stdout.on('data', (data) => {
            console.log(`Output: ${data.toString()}`);
        });

        // Log standard error in real-time
        subprocess.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`);
        });

        // Resolve or reject the promise based on the subprocess exit code
        subprocess.on('close', (code) => {
            if (code === 0) {
                console.log(`Process completed successfully with code ${code}`);
                resolve();
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

