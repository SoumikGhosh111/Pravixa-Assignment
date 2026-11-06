const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  leadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lead', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  actionType: { 
    type: String, 
    enum: ['Stage Change', 'Note Added', 'Created', 'Converted to Client', 'Updated'],  //Lead Converted
    required: true 
  },
  details: { type: String, required: true } 
}, { timestamps: true }); 

module.exports = mongoose.model('Activity', activitySchema);