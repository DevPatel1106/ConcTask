
// backend/src/main.js
const express = require('express');
const http = require('http');
const cors = require('cors');

// require local modules
const routes = require('./api/routes');           // must export router and setSocket()
const { setSocket: setWorkerSocket } = require('./core/workerQueue'); // must export init(io) and scheduleTask etc.

// const { scheduleTask } = require("../src/core/workerQueue");
// scheduleTask({ id: "test-1" }, 1000);

const app = express();
app.use(cors());
app.use(express.json());

//mount API routes under /api
app.use('/api', routes);

// create HTTP server (needed for socket.io)
const server = http.createServer(app);

// socket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {origin: "*"}
});

io.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Socket client disconnected:', socket.id);
    });
});


//Provide io to modules that need to emit updates
setWorkerSocket(io);
// if(typeof workerQueue.init === 'function') {
//     workerQueue.init(io);
// } else {
//     console.warn('workerQueue.init(io) is not found - live task updates will be unavailable.');
// }

//routes is an express Router - attach socket to it if it exposes setSocket
if(typeof routes.setSocket === 'function') {
    routes.setSocket(io);
} else {
    // routes may not expose socket
}

//start server

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

