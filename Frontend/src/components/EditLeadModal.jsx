import { useState, useEffect } from 'react';
import { useUpdateLeadMutation} from '../hooks/useLeadQueries';
import {useAgentsQuery} from '../hooks/useAgentsQueries'; 
import { useAuth } from '../context/AuthContext';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Won', 'Lost'];
const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other'];

export default function EditLeadModal({ isOpen, onClose, lead }) {
  const { user } = useAuth();
  const currentUser = user?.data?.user || user?.user || user?.data || user;
  const isAdmin = currentUser?.role === 'Admin';

  const updateLeadMutation = useUpdateLeadMutation();
  
  // Only needed if user is Admin, though safe to call regardless
  const { data: agentsResponse } = useAgentsQuery();
  const agents = Array.isArray(agentsResponse)
    ? agentsResponse
    : Array.isArray(agentsResponse?.data)
      ? agentsResponse.data
      : agentsResponse?.data?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    expectedValue: '',
    stage: 'New',
    agentId: '',
    projectName: '',
    projectDetails: '',
    agreedAmount: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'Website',
        expectedValue: lead.expectedValue ?? '',
        stage: lead.stage || 'New',
        agentId: lead.agentId?._id || lead.agentId || '',
        projectName: lead.projectName || '',
        projectDetails: lead.projectDetails || '',
        agreedAmount: lead.agreedAmount ?? '',
      });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      expectedValue: Number(formData.expectedValue) || 0,
      stage: formData.stage,
      isClient: formData.stage === 'Won' ? true : lead.isClient,
      projectName: formData.projectName,
      projectDetails: formData.projectDetails,
      agreedAmount: Number(formData.agreedAmount) || 0,
    };

    // Only allow Admin to modify agentId in the payload
    if (isAdmin && formData.agentId) {
      payload.agentId = formData.agentId;
    }

    updateLeadMutation.mutate(
      { leadId: lead?._id, updateData: payload },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Edit Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Expected Value (₹)</label>
              <input
                type="number"
                name="expectedValue"
                value={formData.expectedValue}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Assigned Agent Section: Editable ONLY for Admin, Read-Only for Sales Agent */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Assigned Agent</label>
            {isAdmin ? (
              <select
                name="agentId"
                value={formData.agentId}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Agent --</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={lead.agentId?.name || currentUser?.name || 'Assigned to you'}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            )}
          </div>

          {/* Client / Project Specific Fields if Won or already a Client */}
          {(formData.stage === 'Won' || lead.isClient) && (
            <div className="space-y-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Client & Project Details
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Agreed Budget (₹)</label>
                  <input
                    type="number"
                    name="agreedAmount"
                    value={formData.agreedAmount}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Project Scope / Details</label>
                <textarea
                  name="projectDetails"
                  rows="3"
                  value={formData.projectDetails}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateLeadMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}