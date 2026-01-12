const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { User } = require('./database'); // MongoDB Model use kar rahe hain

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

// --- Registration Logic ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username pehle se hai!" });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true, message: "Account ban gaya!" });
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
    }
});

// --- Login Logic ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ message: "Galat username ya password!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
    }
});

// --- Real-time Chat Logic ---
io.on('connection', (socket) => {
    console.log('Ek user connect hua');

    socket.on('message', (data) => {
        // Sabko message bhejo
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('User chala gaya');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});