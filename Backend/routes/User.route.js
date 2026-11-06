const express = require('express'); 
const router = express.Router();
const userController = require('../controllers/User.controller'); 
const {protect, authorizeRole} = require('../middlewares/Auth.middlware'); 

router.delete('/:userId', protect, authorizeRole('Admin'), userController.deleteUser); 

router.get('/get-agents', protect, authorizeRole('Admin'), userController.getAllAgents); 

module.exports = router; 