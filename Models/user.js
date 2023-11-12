const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    isAdmin: {
        type: Boolean,
        required: true,
    },
    isDisabled: Boolean,
    favouriteBLogs: [String],
    following: [String],
    notifications: [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;