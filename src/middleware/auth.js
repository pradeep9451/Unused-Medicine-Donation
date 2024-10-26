const jwt = require('jsonwebtoken');
const Register = require('../models/registers');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new Error('No token provided');
    }

    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    //console.log('Decoded token:', decoded);

    // Find the regular user by the decoded token
    const user = await Register.findOne({ _id: decoded._id, 'tokens.token': token });

    // If the user is not found, throw an error (do not check for admin)
    if (!user) {
      throw new Error('User not found');
    }

    // Attach the user and token to the request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).send('Unauthorized: Invalid token Please login again');
  }
};

module.exports = auth;
