// generate-token.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = { userId: 'test-user' };
const options = { expiresIn: '1h' };
const token = jwt.sign(payload, process.env.JWT_SECRET, options);
console.log(token);
