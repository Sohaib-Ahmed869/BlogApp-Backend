const express = require('express');
const Router = express.Router();
const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const isAdminMiddleware = async (req, res, next) => {
    const token = req.header('Authorization'); //get the token from the header if present

    //check if the token exists
    if (!token) return res.status(401).send('Access Denied');

    //if the token exists, verify it
    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        if(decoded.isAdmin !== true) {
            return res.status(401).send('Access Denied');
        }
        next();

    }
    catch (err) {
        res.status(400).send('Invalid Token');
    }
};

module.exports = isAdminMiddleware;