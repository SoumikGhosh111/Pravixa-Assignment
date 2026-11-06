const leadService = require('../services/Lead.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createLead = catchAsync(async (req, res, next) => {
  const { name, company, email, phone, source, expectedValue, agentId } = req.body;

  // Basic validation for required fields
  if (!name || !company) {
    throw new AppError('Name and company are required fields', 400);
  }

  if (req.user.role === 'Sales Agent' && req.body.agentId) {
    throw new AppError('Forbidden: Sales Agents cannot assign leads to other agents.', 403);
  }

  const assigny = req.body.agentId || req.user._id;

  const lead = await leadService.createLead(
    { name, company, email, phone, source, expectedValue, agentId },
    assigny,
    req.user._id
  );

  res.status(201).json({
    success: true,
    data: lead
  });
});

const getLeads = catchAsync(async (req, res, next) => {
  let query = {};

  // Restrict the query if the user is a Sales Agent
  if (req.user.role === 'Sales Agent') {
    query.agentId = req.user._id;
  }

  const leads = await leadService.getLeads(query);

  res.status(200).json({
    success: true,
    count: leads.length,
    data: leads
  });
});


const updateLead = catchAsync(async (req, res, next) => {
  const leadId = req.params.leadId;

  const lead = await leadService.getLeadById(leadId);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  if (req.user.role === 'Sales Agent' && lead.agentId.toString() !== req.user._id.toString()) {
    throw new AppError('Forbidden: You can only update your own assigned leads.', 403);
  }

  const updateData = { ...req.body };
  if (req.user.role === 'Sales Agent' && updateData.agentId) {
    delete updateData.agentId;
  }


  const updatedLead = await leadService.updateLead(leadId, updateData, req.user._id);

  res.status(200).json({
    success: true,
    data: updatedLead
  });
});

const deleteLead = catchAsync(async (req, res, next) => {
  const leadId = req.params.leadId;

  // Base filter: always search by the lead's ID
  const filter = { _id: leadId };

  // If the user is a Sales Agent, restrict the deletion to only their own leads
  if (req.user.role === 'Sales Agent') {
    filter.agentId = req.user._id;
  }

  const deletedLead = await leadService.deleteLead(filter);

  if (!deletedLead) {
    throw new AppError('Lead not found or you do not have permission to delete it.', 404);
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});


const getSingleLead = catchAsync(async (req, res, next) => {
  const leadId = req.params.leadId;

  // Base filter: search by the lead's ID
  const filter = { _id: leadId };

  // Role check: If Sales Agent, enforce ownership 
  if (req.user.role === 'Sales Agent') {
    filter.agentId = req.user._id;
  }

  const result = await leadService.getLeadByIdWithActivities(filter);

  if (!result) {
    throw new AppError('Lead not found or you do not have permission to view it.', 404);
  }

  res.status(200).json({
    success: true,
    data: result.lead,
    timeline: result.activities
  });
});

const addNote = catchAsync(async (req, res, next) => {
  const leadId = req.params.leadId;
  const { note } = req.body;

  if (!note) {
    throw new AppError('Note text is required.', 400);
  }

  const filter = { _id: leadId };


  if (req.user.role === 'Sales Agent') {
    filter.agentId = req.user._id;
  }


  const newActivity = await leadService.addLeadNote(filter, leadId, req.user._id, note);

  if (!newActivity) {
    throw new AppError('Lead not found or you do not have permission to add notes to it.', 404);
  }

  res.status(201).json({
    success: true,
    data: newActivity
  });
});

module.exports = { createLead, getLeads, updateLead, deleteLead, getSingleLead, addNote };