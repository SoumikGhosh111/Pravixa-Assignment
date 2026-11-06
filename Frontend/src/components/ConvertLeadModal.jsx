import { useState, useEffect } from 'react';
import { useConvertLeadMutation } from '../hooks/useLeadQueries';

export default function ConvertLeadModal({ isOpen, onClose, lead }) {
  const convertMutation = useConvertLeadMutation();

  const [formData, setFormData] = useState({
    projectName: '',
    projectDetails: '',
    agreedAmount: '',
  });

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        projectName: lead.projectName || lead.project || `${lead.company || lead.name} - Software Project`,
        projectDetails: lead.projectDetails || '',
        agreedAmount: lead.agreedAmount ?? lead.expectedValue ?? '',
      });
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    convertMutation.mutate(
      {
        leadId: lead._id,
        projectName: formData.projectName.trim(),
        projectDetails: formData.projectDetails.trim(),
        agreedAmount: Number(formData.agreedAmount) || 0,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Convert Lead to Client</h3>
              <p className="text-xs text-slate-500">
                Mark <span className="font-semibold text-slate-700">{lead.name}</span> as Won & start project
              </p>
            </div>
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
          {convertMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {convertMutation.error?.response?.data?.message ||
                convertMutation.error?.message ||
                'Failed to convert lead'}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Project Name *</label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
              placeholder="e.g., Enterprise CRM Portal"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Agreed Project Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.agreedAmount}
              onChange={(e) => setFormData((prev) => ({ ...prev, agreedAmount: e.target.value }))}
              placeholder="30000"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Project Scope / Kickoff Notes
            </label>
            <textarea
              rows="3"
              value={formData.projectDetails}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectDetails: e.target.value }))}
              placeholder="Deliverables, timeline, or special terms..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

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
              disabled={convertMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {convertMutation.isPending ? 'Converting...' : 'Confirm & Convert to Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}