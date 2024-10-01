const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    mongoose.connect(process.env.DB_URI, {
    
    })
    .then(result => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });
};

module.exports = connectDB;