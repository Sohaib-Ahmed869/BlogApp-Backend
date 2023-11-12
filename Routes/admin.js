const Router = require('express').Router();
const User = require('../Models/user');
const Blog = require('../Models/blog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isAdminMiddleware = require('../Middleware/isAdmin');

const SECRET_KEY = 'your_secret_key';

//get all users
Router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json({ error: null, data: users });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//disable a user
Router.put('/:username', isAdminMiddleware, async (req, res) => {
    try {
        const Us = await User.findOne({ username: req.params.username });
        Us.isDisabled = true;
        await Us.save();
        res.json({ error: null, data: Us });

    }
    catch (error) {
        res.status(400).json({ error });
    }
});

//enable a user
Router.put('/enable/:username', isAdminMiddleware, async (req, res) => {
    try {
        const Us = await User.findOne({ username: req.params.username });
        Us.isDisabled = false;
        await Us.save();
        res.json({ error: null, data: Us });

    }
    catch (error) {
        res.status(400).json({ error });
    }
});

//view a particular blog
Router.get('/blog/:title', async (req, res) => {

    try {
        const { title } = req.params;
        const blog = await Blog.findOne({ title: title });
        res.json({ error: null, data: blog });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//view all blogs
Router.get('/blog', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//disable a blog
Router.put('/blog/:title', isAdminMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findOne({ title: req.params.title });
        blog.isDisabled = true;
        await blog.save();
        res.json({ error: null, data: blog });

    }
    catch (error) {
        res.status(400).json({ error });
    }
});

//enable a blog
Router.put('/blog/enable/:title', isAdminMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findOne({ title: req.params.title });
        blog.isDisabled = false;
        await blog.save();
        res.json({ error: null, data: blog });

    }
    catch (error) {
        res.status(400).json({ error });
    }
});

