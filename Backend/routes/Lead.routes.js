const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middlewares/Auth.middlware'); 
const leadController = require('../controllers/Lead.controller'); 

router.post('/create-lead', protect, leadController.createLead);

router.get('/get-lead', protect, leadController.getLeads);

router.post('/:leadId/update-lead', protect, leadController.updateLead);

router.delete('/:leadId/delete-lead', protect, leadController.deleteLead);

router.get('/:leadId/get-lead-by-id', protect, leadController.getSingleLead);

router.post('/:leadId/notes', protect, leadController.addNote);



module.exports = router;