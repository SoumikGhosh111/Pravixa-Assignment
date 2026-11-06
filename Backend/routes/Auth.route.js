const express = require('express'); 
const router = express.Router();
const AuthController = require('../controllers/Auth.controller'); 
const {protect } = require('../middlewares/Auth.middlware'); 

router.post('/login',AuthController.login); 

router.post('/logout',AuthController.logout); 


router.get('/me', protect, AuthController.getCurrentUser);

module.exports = router; 