const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Helper to run code in Docker
const executeCode = (language, code, input) => {
    return new Promise((resolve) => {
        const id = uuidv4();
        const tempDir = path.join(__dirname, 'temp', id);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const inputPath = path.join(tempDir, 'input.txt');
        fs.writeFileSync(inputPath, input);

        let dockerCmd = '';
        let fileName = '';

        if (language === 'Python') {
            fileName = 'solution.py';
            fs.writeFileSync(path.join(tempDir, fileName), code);
            dockerCmd = `docker run --rm -i --network none --memory=128m --cpus=0.5 -v "${tempDir}:/app" -w /app python:3.9-slim bash -c "python3 solution.py < input.txt"`;
        } else if (language === 'C++') {
            fileName = 'solution.cpp';
            fs.writeFileSync(path.join(tempDir, fileName), code);
            dockerCmd = `docker run --rm -i --network none --memory=256m --cpus=0.5 -v "${tempDir}:/app" -w /app gcc:latest bash -c "g++ solution.cpp -o solution && ./solution < input.txt"`;
        } else if (language === 'Java') {
            fileName = 'Solution.java';
            fs.writeFileSync(path.join(tempDir, fileName), code);
            dockerCmd = `docker run --rm -i --network none --memory=512m --cpus=0.5 -v "${tempDir}:/app" -w /app openjdk:17-slim bash -c "javac Solution.java && java Solution < input.txt"`;
        }

        const startTime = Date.now();
        exec(dockerCmd, (error, stdout, stderr) => {
            const duration = (Date.now() - startTime) / 1000;

            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });

            resolve({
                stdout,
                stderr,
                error: error ? error.message : null,
                duration: `${duration}s`
            });
        });
    });
};

app.post('/execute', async (req, res) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required' });
    }

    try {
        const result = await executeCode(language, code, input || '');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Execution server running on http://localhost:${PORT}`);
});
