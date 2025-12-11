const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend/dist
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const sessions = {};

app.post('/sessions', (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 9);
    sessions[sessionId] = {
        sessionId,
        createdAt: new Date().toISOString(),
        code: '// Start coding here...',
        language: 'javascript'
    };
    res.status(201).json(sessions[sessionId]);
});

app.get('/sessions/:sessionId', (req, res) => {
    const session = sessions[req.params.sessionId];
    if (session) {
        res.json(session);
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// SPA Fallback - must be last
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;
