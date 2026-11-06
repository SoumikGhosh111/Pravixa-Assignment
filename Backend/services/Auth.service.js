const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/User.model'); 
const AppError = require('../utils/AppError'); 

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JSONWEBTOKEN_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404); 
  }
  
  return user;
};

module.exports = { authenticateUser, getUserById }; 