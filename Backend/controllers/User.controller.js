const userService = require('../services/User.service'); // Adjust path as needed
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError'); 

const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Optional safeguard: Prevent an Admin from deleting themselves
  if (req.user._id.toString() === userId) {
    throw new AppError('You cannot delete your own admin account.',400);
  }

  const deletedUser = await userService.deleteUserById(userId);

  if (!deletedUser) {

    throw new AppError('User not found.' ,404);
  }

  res.status(200).json({
    success: true,
    message: 'User successfully deleted',
    data: {}
  });
});

const getAllAgents = catchAsync(async (req, res, next) => {

    const agents = await userService.fetchAllAgentsService();

    return res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
});

module.exports = { deleteUser,getAllAgents  };