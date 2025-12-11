const http = require('http');
const { Server } = require("socket.io");
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    // Simple code broadcast - in a real app use Yjs/CRDTs
    socket.on('code-change', ({ sessionId, code }) => {
        socket.to(sessionId).emit('code-update', code);
    });

    socket.on('language-change', ({ sessionId, language }) => {
        socket.to(sessionId).emit('language-update', language);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
