const User = require('../model/User.model'); // Adjust path as needed

const deleteUserById = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

const fetchAllAgentsService = async () => {
  // Fetch all users (or pass { role: 'Agent' } inside .find() if you only want Sales Agents)
  const agents = await User.find({ role: 'Sales Agent' })
    .select('_id name email role')
    .sort({ name: 1 })
    .lean();

  return agents;
};

module.exports = { deleteUserById, fetchAllAgentsService };