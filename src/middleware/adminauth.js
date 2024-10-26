const jwt = require('jsonwebtoken');
const Adminregister = require('../models/adminregisters');

const adminauth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new Error('No token provided');
    }

    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
   // console.log('Decoded token:', decoded);

    // Find the admin by the decoded token
    const admin = await Adminregister.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Attach the admin and token to the request object
    req.admin = admin;
    req.token = token;

    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    res.status(401).send('Unauthorized: Invalid token Please login again');
  }
};

module.exports = adminauth;
