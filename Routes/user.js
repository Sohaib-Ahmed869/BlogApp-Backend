const Router = require('express').Router();
const User = require('../Models/user');
const Blog = require('../Models/blog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../Middleware/AuthMiddleware');

const SECRET_KEY = 'your_secret_key';

Router.post('/register', async (req, res) => {
    try {
        const { username, password, email, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email, isAdmin });
        await user.save(); 
        res.json({ error: null, data: { username, email, password, isAdmin } });
    } catch (error) {
        res.status(400).json({ error });
    }
});

Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        //if user is disabled
        if (user.isDisabled) {
            return res.status(401).json({ error: 'User is disabled.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin, username: user.username }, SECRET_KEY, {
            expiresIn: '1h',
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed. Please try again.' });
    }
});

Router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        res.json({ error: null, data: user });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//follow another user
Router.post('/follow/:username', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        const userToFollow = await User.findOne({ username: req.params.username });
        if (!userToFollow) {
            return res.status(401).json({ error: 'User does not exist.' });
        }
        if (userToFollow.isDisabled) {
            return res.status(401).json({ error: 'User is disabled.' });
        }
        if (user.following.includes(userToFollow.username)) {
            return res.status(401).json({ error: 'User is already followed.' });
        }
        user.following.push(userToFollow.username);
        await user.save();
        //send notification to userToFollow
        userToFollow.notifications.push(user.username + " started following you.");
        res.json({ error: null, data: user });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//feed to show all blogs of followed users
Router.get('/feed', authMiddleware, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');

        const user = await User.findOne({ username: decoded.username });
        if(!user) return res.status(400).json({ error: 'User does not exist' });
        const following = user.following;
        const blogs = [];
        for (let i = 0; i < following.length; i++) {
            const userToFollow = await User.findOne({ username: following[i] });
            const userBlogs = await Blog.find({ authorName: userToFollow.username });
            for (let j = 0; j < userBlogs.length; j++) {
                if (userBlogs[j].isDisabled === false)
                    blogs.push(userBlogs[j]);
            }
        }
        res.json({ error: null, data: blogs });
    } catch (error) {
        res.status(400).json({ error });
    }
});


module.exports = Router;

