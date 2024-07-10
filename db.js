const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL

mongoose.connect(mongoURL);


const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB server');
})

db.on('error', (error) => {
    console.log('MongoDB connection error: ', error);
})

db.on('disconnected', () => {
    console.log("MongoDB Disconnected");
});

module.exports = db;