const authService = require('../services/Auth.service'); 
const catchAsync = require('../utils/catchAsync'); 


 // Configure cookie security settings
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
    sameSite: 'strict' // Protects against Cross-Site Request Forgery (CSRF)
  };

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const { token, user } = await authService.authenticateUser(email, password);
  

  // Attach token to response cookie named 'jwt'
  res.cookie('jwt', token, cookieOptions);
  
  // Return user data without exposing the token in the JSON body
  res.status(200).json({ 
    success: true, 
    user 
  });
});

const logout = catchAsync(async (req, res, next) => {
  // Replace 'jwt' with whatever name you used when setting the cookie during login
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Matches your login cookie settings
  });

  res.status(200).json({
    success: true,
    message: 'User successfully logged out.'
  });
});

const getCurrentUser =  catchAsync(async (req, res) => {
  try {
    // Assuming your verifyToken middleware attaches the decoded payload to req.user
    const userId = req.user.id; 
    
    const user = await authService.getUserById(userId);
    
    res.status(200).json({ data: user });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Server error while fetching user session' 
    });
  }
});

module.exports = { login, logout, getCurrentUser };
