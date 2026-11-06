const jwt = require('jsonwebtoken');
const User = require('../model/User.model'); 
const catchAsync = require('../utils/catchAsync'); 
const AppError = require('../utils/AppError'); 


const protect = catchAsync(async (req, res, next) => {

  const token = req.cookies?.jwt;

  if (!token) {
    throw new AppError('You are not logged in. Please log in to gain access.', 401);
  }


  const decoded = jwt.verify(token, process.env.JSONWEBTOKEN_SECRET);

   
  const currentUser = await User.findById(decoded.id).select('-password');
  
  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  req.user = currentUser;
  next();
});


const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => { 


    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have the required permissions.', 403));
    }
    next();
  };
};

module.exports = { protect, authorizeRole };