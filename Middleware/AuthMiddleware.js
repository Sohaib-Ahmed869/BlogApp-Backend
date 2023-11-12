const express = require('express');
const Router = express.Router();
const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization'); //get the token from the header if present


    if (!token) return res.status(401).send('Access Denied');

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        if(decoded.username !== req.body.username) {

            return res.status(401).send('Access Denied here'+ decoded.username + req.body.username);
        }
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

module.exports = authMiddleware;
