const mongoose = require('mongoose');
const Blog = require('../Models/blog');
const User = require('../Models/user');
const jwt = require('jsonwebtoken');

const Router = require('express').Router();

const authMiddleware = require('../Middleware/AuthMiddleware');

Router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ isDisabled: false });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

Router.get('/:title', async (req, res) => {

    try {
        const { title } = req.params;
        const blog = await Blog.findOne({ title: title });
        if (blog.isDisabled) {
            return res.status(401).json({ error: 'Blog is disabled.' });
        }
        res.json({ error: null, data: blog });
    } catch (error) {
        res.status(400).json({ error });
    }
});


Router.post('/', async (req, res) => {
    try {
        const AuthorName = req.body.username;
        const blog = new Blog({ ...req.body, authorName: AuthorName });
        await blog.save();
        res.json({ error: null, data: blog });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//only allow owner to update own blog - the json web token will be used to verify the owner

Router.put('/:title', authMiddleware, async (req, res) => {
    try {
        const { title } = req.params;
        const blog = await Blog.findOneAndUpdate({ title: title }, req.body);
        res.json({ error: null, data: blog });
    }
    catch (error) {
        res.status(400).json({ error });
    }
});

Router.delete('/:title', authMiddleware, async (req, res) => {
    try {
        const { title } = req.params;
        const blog = await Blog.findOneAndDelete({ title: title });
        res.json({ error: null, data: blog });
    }
    catch (error) {
        res.status(400).json({ error });
    }
});

//rate a blog
Router.post('/rate/:title', authMiddleware, async (req, res) => {
    try {
        const { title } = req.params;
        const { rating, username } = req.body;
        const blog = await Blog.findOne({ title: title });
        if (blog.isDisabled) {
            return res.status(401).json({ error: 'Blog is disabled.' });
        }
        if (blog.ratings.length === 0) {
            blog.ratings.push({ username: username, rating: rating });
            await blog.save();
            return res.json({ error: null, data: blog });
        }
        for (let i = 0; i < blog.ratings.length; i++) {
            if (blog.ratings[i].username === username) {
                blog.ratings[i].rating = rating;
                await blog.save();
                return res.json({ error: null, data: blog });
            }
        }
        blog.ratings.push({ username: username, rating: rating });
        await blog.save();
        res.json({ error: null, data: blog });
    }
    catch (error) {
        res.status(400).json({ error });
    }
});

//comment on a blog
Router.post('/comment/:title', authMiddleware, async (req, res) => {
    try {
        const { title } = req.params;
        const { comment, username } = req.body;
        const blog = await Blog.findOne({ title: title });
        if (blog.isDisabled) {
            return res.status(401).json({ error: 'Blog is disabled.' });
        }
        blog.comments.push({ username: username, comment: comment });
        await blog.save();
        res.json({ error: null, data: blog });
    }
    catch (error) {
        res.status(400).json({ error });
    }
});

// add a blog title to user's favourites array
Router.post('/favourite/:title', authMiddleware, async (req, res) => {

    try {

        const { title } = req.params;
        const { username } = req.body;

        // find the user
        const Us = await User.findOne({ username: username });
        
        if(!Us) return res.status(400).json({ error: 'User does not exist' });
        // find the blog
        const blog = await Blog.findOne({ title: title });

        if(!blog) return res.status(400).json({ error: 'Blog does not exist' });

        // check if the blog is already in the user's favourites array
        if (Us.favouriteBLogs.includes(blog.title)) {
            return res.status(400).json({ error: 'Blog already in favourites' });
        }

        // add the blog title to the user's favourites array
        Us.favouriteBLogs.push(blog.title);

        // save the user
        await Us.save();

        res.json({ error: null, data: Us });

    } catch (error) {
        res.status(400).json({ error });
    }
});

// remove a blog title from user's favourites array
Router.delete('/favourite/:title', authMiddleware, async (req, res) => {

    try {

        const { title } = req.params;
        const { username } = req.body;

        // find the user
        const Us = await User.findOne({ username: username });

        if(!Us) return res.status(400).json({ error: 'User does not exist' });

        // find the blog
        const blog = await Blog.findOne({ title: title });

        if(!blog) return res.status(400).json({ error: 'Blog does not exist' });

        // check if the blog is in the user's favourites array
        if (!Us.favouriteBLogs.includes(blog.title)) {
            return res.status(400).json({ error: 'Blog not in favourites' });
        }

        // remove the blog title from the user's favourites array
        Us.favouriteBLogs = Us.favouriteBLogs.filter((blogTitle) => blogTitle !== blog.title);

        // save the user
        await Us.save();

        res.json({ error: null, data: Us });

    } catch (error) {
        res.status(400).json({ error });
    }
});

// get all blogs in user's favourites array
Router.get('/favourite/:username', authMiddleware, async (req, res) => {

    try {

        const { username } = req.params;

        // find the user
        const Us = await User.findOne({ username: username });

        if(!Us) return res.status(400).json({ error: 'User does not exist' });

        // get all blogs in user's favourites array
        const blogs = await Blog.find({ title: { $in: Us.favouriteBLogs } });

        res.json({ error: null, data: blogs });

    } catch (error) {
        res.status(400).json({ error });
    }
});

//sort blogs by rating
Router.get('/rating/sort', async (req, res) => {
    try {
        const blogs = await Blog.find({ isDisabled: false });
        blogs.sort(function (a, b) {
            return b.ratings.length - a.ratings.length;
        });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//sort blogs by chronological order
Router.get('/date/sort', async (req, res) => {
    try {
        const blogs = await Blog.find({ isDisabled: false });
        blogs.sort(function (a, b) {
            return b.createdAt - a.createdAt;
        });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//search blogs by title
Router.get('/search/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const blogs = await Blog.find({ title: { $regex: title, $options: 'i' } });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//filter blogs by author
Router.get('/search/:authorName', async (req, res) => {
    try {
        const { authorName } = req.params;
        const blogs = await Blog.find({ authorName: authorName });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//filter blogs by rating
Router.get('/search/rating/:rating', async (req, res) => {
    try {
        const { rating } = req.params;
        const blogs = await Blog.find({ isDisabled: false });
        const filteredBlogs = [];
        for (let i = 0; i < blogs.length; i++) {
            if (blogs[i].ratings.length >= rating) {
                filteredBlogs.push(blogs[i]);
            }
        }
        res.json({ error: null, data: filteredBlogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//filter blogs by date
Router.get('/search/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const blogs = await Blog.find({ isDisabled: false });
        const filteredBlogs = [];
        for (let i = 0; i < blogs.length; i++) {
            if (blogs[i].createdAt >= date) {
                filteredBlogs.push(blogs[i]);
            }
        }
        res.json({ error: null, data: filteredBlogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//match to exact createdAt||title||authorName in json
Router.get('/search/', async (req, res) => {
    try {
        const { createdAt, title, authorName } = req.body;
        const blogs = await Blog.find({ createdAt: createdAt, title: title, authorName: authorName });
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});


module.exports = Router;