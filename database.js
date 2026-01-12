const mongoose = require('mongoose');
require('dotenv').config(); // Yeh .env file se secret password padhne ke liye hai

// Aapka connection string ab secret variable se aayega
const mongoURI = process.env.MONGO_URI; 

if (!mongoURI) {
    console.error("❌ Error: MONGO_URI is not defined in .env file!");
}

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected! Database is ready."))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// User ka structure (Schema)
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Asli app mein ise encrypt karna chahiye
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };