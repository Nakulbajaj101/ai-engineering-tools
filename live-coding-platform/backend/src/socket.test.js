const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const app = require("./app");

describe("Socket Integration", () => {
    let io, server, clientSocket1, clientSocket2;
    const PORT = 3001; // Use different port for tests

    beforeAll((done) => {
        server = createServer(app);
        io = new Server(server, { cors: { origin: "*" } });

        // Copy the logic from index.js or refactor index.js to export the socket setup
        // For now, replicating simple logic for the test
        io.on('connection', (socket) => {
            socket.on('join-session', (sessionId) => {
                socket.join(sessionId);
            });
            socket.on('code-change', ({ sessionId, code }) => {
                socket.to(sessionId).emit('code-update', code);
            });
        });

        server.listen(PORT, () => {
            done();
        });
    });

    afterAll((done) => {
        io.close();
        server.close();
        done();
    });

    beforeEach((done) => {
        clientSocket1 = new Client(`http://localhost:${PORT}`);
        clientSocket2 = new Client(`http://localhost:${PORT}`);

        let connectedCount = 0;
        const onConnect = () => {
            connectedCount++;
            if (connectedCount === 2) done();
        };

        clientSocket1.on("connect", onConnect);
        clientSocket2.on("connect", onConnect);
    });

    afterEach(() => {
        clientSocket1.close();
        clientSocket2.close();
    });

    test("clients should be able to join session and exchange code", (done) => {
        const sessionId = "test-session";
        const codeSnippet = "console.log('hello world');";

        clientSocket1.emit("join-session", sessionId);
        clientSocket2.emit("join-session", sessionId);

        // Wait a bit for joins to process
        setTimeout(() => {
            clientSocket2.on("code-update", (code) => {
                expect(code).toBe(codeSnippet);
                done();
            });

            clientSocket1.emit("code-change", { sessionId, code: codeSnippet });
        }, 50);
    });
});
