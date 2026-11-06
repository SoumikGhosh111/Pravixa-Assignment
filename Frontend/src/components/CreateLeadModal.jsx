import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateLeadMutation } from '../hooks/useLeadQueries';
import { useAgentsQuery } from '../hooks/useAgentsQueries';

export default function CreateLeadModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const currentUser = user?.data?.user || user?.user || user?.data || user;
  const isAdmin = currentUser?.role === 'Admin';

  const createLeadMutation = useCreateLeadMutation();

  // Only fetch the agents list if the modal is open AND the user is an Admin
  const {
    data: agentsResponse,
    isLoading: isLoadingAgents,
    isError: isAgentsError,
  } = useAgentsQuery(isOpen && isAdmin);

  // Safely extract the array from { success: true, count: X, data: [...] }
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
    source: 'Website Contact Form',
    expectedValue: '',
    stage: 'New',
    agentId: '',
  });

  
  useEffect(() => {
    if (isOpen) {
      if (!isAdmin && currentUser?._id) {
        setFormData((prev) => ({ ...prev, agentId: currentUser._id }));
      } else if (isAdmin && currentUser?._id) {
        setFormData((prev) => ({ ...prev, agentId: currentUser._id }));
      }
    }
  }, [isOpen, isAdmin, currentUser?._id]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   const payload = {
  //     ...formData,
  //     expectedValue: formData.expectedValue ? Number(formData.expectedValue) : 0,
  //     // Strictly enforce self-assignment if logged in as a Sales Agent
  //     agentId: isAdmin ? formData.agentId : currentUser?._id,
  //   };

  //   createLeadMutation.mutate(payload, {
  //     onSuccess: () => {
  //       setFormData({
  //         name: '',
  //         company: '',
  //         email: '',
  //         phone: '',
  //         source: 'Website Contact Form',
  //         expectedValue: '',
  //         stage: 'New',
  //         agentId: isAdmin ? (agents[0]?._id ?? currentUser?._id ?? '') : (currentUser?._id ?? ''),
  //       });
  //       onClose();
  //     },
  //   });
  // };

 const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      stage: formData.stage,
      expectedValue: formData.expectedValue ? Number(formData.expectedValue) : 0,
    };

  
    if (isAdmin && formData.agentId) {
      payload.agentId = formData.agentId;
    }

    createLeadMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          source: 'Website Contact Form',
          expectedValue: '',
          stage: 'New',
          agentId: '',
        });
        onClose();
      },
    });
  };

  return (
    /* Backdrop Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create New Lead</h3>
            <p className="text-xs text-slate-500">Enter lead details and assign an owner.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {createLeadMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {createLeadMutation.error?.response?.data?.message ||
                createLeadMutation.error?.message ||
                'Failed to create lead'}
            </div>
          )}

          {/* Row 1: Name & Company */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Bruce Wayne"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Company *</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Wayne Enterprises"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="bruce@wayne.com"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91-9876543210"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Row 3: Assign Agent (Dropdown for Admin, Locked Input for Sales Agent) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Assign to Agent *</label>
              {isAdmin && isAgentsError && (
                <span className="text-[11px] text-red-500">Failed to load agents list</span>
              )}
            </div>

            {isAdmin ? (
              <select
                name="agentId"
                required
                value={formData.agentId}
                onChange={handleChange}
                disabled={isLoadingAgents}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer disabled:bg-slate-100"
              >
                <option value="" disabled>
                  {isLoadingAgents ? 'Fetching available agents...' : 'Select an agent'}
                </option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} — {agent.email} {agent.role ? `(${agent.role})` : ''}
                  </option>
                ))}
              </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={
                    currentUser?.name
                      ? `${currentUser.name} — ${currentUser.email}`
                      : 'Assigned to You'
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              )}
          </div>

          {/* Row 4: Value, Source & Stage */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Expected Value (₹)</label>
              <input
                type="number"
                name="expectedValue"
                min="0"
                value={formData.expectedValue}
                onChange={handleChange}
                placeholder="30000"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Lead Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="Website Contact Form">Website Form</option>
                <option value="LinkedIn Prospecting">LinkedIn</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Initial Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLeadMutation.isPending || (isAdmin && isLoadingAgents)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
            >
              {createLeadMutation.isPending ? 'Creating Lead...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}