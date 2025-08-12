console.log(`--- EXECUTING FILE: ${__filename} ---
`);
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Wrap startup in an async function to handle promises
async function startServer() {
    try {
        // Login Route - Authentication bypassed as per user's request
        app.post('/api/login', (req, res) => {
            // Since authentication is bypassed, always return a success response
            // You might want to return a dummy token or a simple success message
            const dummyToken = 'dummy-jwt-token-for-dashboard-access';
            res.json({ token: dummyToken, username: 'guest' });
        });

        const PORT = process.env.PORT || 3001;

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
}

startServer();
