const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('draw', (data) => {
        socket.broadcast.emit('ondraw', data);
    });

    socket.on('clear', () => {
        socket.broadcast.emit('onclear');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
