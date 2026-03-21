import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Load .env.local manually since it's in the project root
const envPath = path.resolve(process.cwd(), '.env.local');
let envData = '';
try {
    envData = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Could not read .env.local file at', envPath);
}

const envConfig = {};
envData.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
        envConfig[key.trim()] = value.join('=').trim();
    }
});

const apiKey = envConfig.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local or environment variables.');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: apiKey,
});

async function testDirectAPI() {
    console.log('--- Testing Direct OpenAI API Connectivity ---');
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "OpenAI is working!"' }],
            max_tokens: 15,
        });
        console.log('✅ Direct API Success:', response.choices[0].message.content);
    } catch (error) {
        console.error('❌ Direct API Failure:', error.message);
    }
}

async function testLocalEndpoint() {
    console.log('\n--- Testing Local Project API Endpoint (/api/chat) ---');
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hello, this is a test from the script.' }],
            }),
        });

        if (response.ok) {
            console.log('✅ Local Endpoint Success (Receiving stream...):');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                process.stdout.write(chunkValue);
            }
            console.log('\n✅ Local Endpoint Stream Completed');
        } else {
            let errorDetail = 'Unknown error';
            try {
                const errorData = await response.json();
                errorDetail = JSON.stringify(errorData);
            } catch (e) {
                errorDetail = await response.text();
            }
            console.error(`❌ Local Endpoint Failure (Status ${response.status}):`, errorDetail);
        }
    } catch (error) {
        console.error('❌ Local Endpoint Fetch Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('TIP: Make sure your development server (npm run dev) is running on http://localhost:3000');
        }
    }
}

async function runTests() {
    await testDirectAPI();
    await testLocalEndpoint();
}

runTests();
