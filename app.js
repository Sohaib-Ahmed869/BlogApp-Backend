const mongoose = require('mongoose');
const express = require('express');
const app = express();

const userRoute = require('./Routes/user');
const blogRoute = require('./Routes/blog');

//connect to mongodb database
mongoose.connect('mongodb://127.0.0.1:27017/blog'
).then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.log('Error connecting to database', err);
});

//middleware
app.use(express.json());

//set route
app.use('/user', userRoute);
app.use('/blog', blogRoute);


//start listening to the server
app.listen(3000, () => {
    console.log('Server started');
});