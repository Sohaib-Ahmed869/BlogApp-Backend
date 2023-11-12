const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDisabled : {type: Boolean, default: false},
    //store ratings as an object of username and rating
    ratings: [{
        username: String,
        rating: Number
    }],
    //store comments as an object of username and comment
    comments: [{
        username: String,
        comment: String
    }],
});

module.exports = mongoose.model('Blog', blogSchema);