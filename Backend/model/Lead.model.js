const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  source: { type: String },
  expectedValue: { type: Number },
  stage: {
    type: String,
    enum: ['New', 'Contacted', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New'
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isClient: { type: Boolean, default: false },
  agreedAmount: { type: Number, default: 0 },

  projectName: {
    type: String,
    trim: true,
  },
  projectDetails: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);