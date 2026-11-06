const Lead = require('../model/Lead.model') 
const Activity = require('../model/Activity.model'); 

const createLead = async (leadData, assignedAgentId, userId) => {
  
  const lead = await Lead.create({
    ...leadData,
    agentId: assignedAgentId,
  });

  await Activity.create({
    leadId: lead._id,
    userId: userId,
    actionType: 'Created',
    details: 'Lead was added to the pipeline.'
  });

  return lead;
};

const getLeads = async (query) => {
  return await Lead.find(query)
    .populate('agentId', 'name email') 
    .sort({ createdAt: -1 });
};


const getLeadById = async (leadId) => {
  return await Lead.findById(leadId);
};

 const updateLead = async (leadId, updateData, userId) => {

  if (updateData.stage === 'Won') {
    updateData.isClient = true;
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    leadId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('agentId', '_id name email');

  if (updatedLead && userId) {
    const isConversion = updateData.stage === 'Won' && updateData.projectName;
    await Activity.create({
      leadId: updatedLead._id,
      userId,
      actionType: isConversion ? 'Converted to Client' : 'Updated',
      details: isConversion
        ? `Lead marked Won! Converted to client with project "${updateData.projectName}" for ₹${Number(updateData.agreedAmount || 0).toLocaleString()}.`
        : 'Lead details or stage were updated.',
    });
  }

  return updatedLead;
};

const deleteLead = async (filter) => {
  return await Lead.findOneAndDelete(filter);
};

const getLeadByIdWithActivities = async (filter) => {

  const lead = await Lead.findOne(filter).populate('agentId', 'name email');
  
  if (!lead) return null;

  const activities = await Activity.find({ leadId: lead._id })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });   

  return { lead, activities };
};

const addLeadNote = async (filter, leadId, userId, noteText) => {

  const lead = await Lead.findOne(filter);
  
  if (!lead) return null;

  return await Activity.create({
    leadId: leadId,
    userId: userId,
    actionType: 'Note Added',
    details: noteText
  });
};

module.exports = { createLead, getLeads, getLeadById, updateLead, deleteLead, getLeadByIdWithActivities, addLeadNote }; ;