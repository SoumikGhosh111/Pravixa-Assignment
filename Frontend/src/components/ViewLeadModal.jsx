import { useState } from 'react';
import { useLeadActivitiesQuery, useAddLeadNoteMutation } from '../hooks/useLeadQueries';

export default function ViewLeadModal({ isOpen, onClose, lead, onEdit }) {
  const [noteText, setNoteText] = useState('');

  const { data: leadDetailResponse, isLoading: isLoadingTimeline } = useLeadActivitiesQuery(
    lead?._id,
    isOpen
  );
  const addNoteMutation = useAddLeadNoteMutation();

  if (!isOpen || !lead) return null;

  // 1. Extract the lead object from response.data (or fallback to the row prop)
  const detailedLead =
    leadDetailResponse?.data?._id
      ? leadDetailResponse.data
      : leadDetailResponse?._id
      ? leadDetailResponse
      : lead;

  // 2. Extract the top-level timeline array from { success: true, data: {...}, timeline: [...] }
  const rawActivities =
    leadDetailResponse?.timeline ||
    leadDetailResponse?.data?.timeline ||
    detailedLead?.timeline ||
    [];

  // Sort newest first
  const activities = [...rawActivities].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNoteMutation.mutate(
      { leadId: lead._id, text: noteText.trim() },
      {
        onSuccess: () => {
          setNoteText('');
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg border border-indigo-100">
              {detailedLead.name?.charAt(0).toUpperCase() || 'L'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{detailedLead.name}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    detailedLead.stage === 'Won'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : detailedLead.stage === 'Lost'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {detailedLead.stage || 'New'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 truncate">
                {detailedLead.company || 'No company listed'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: Left (Details) & Right (Activity Timeline) */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Lead Info */}
          <div className="space-y-4 text-sm lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Expected Deal Value</p>
                <p className="mt-0.5 text-lg sm:text-xl font-bold text-indigo-600">
                  ₹{(detailedLead.expectedValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-2">
                <p className="text-xs font-medium text-slate-500">Client Status</p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {detailedLead.isClient || detailedLead.stage === 'Won'
                    ? 'Converted Client'
                    : 'Active Prospect'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="mt-0.5 font-medium text-slate-800 break-all">
                  {detailedLead.email || 'Not provided'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number
                </p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {detailedLead.phone || 'Not provided'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Lead Source
                </p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {detailedLead.source || 'Direct / Unknown'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Agent
                </p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {detailedLead.agentId?.name || 'Unassigned'}
                </p>
                {detailedLead.agentId?.email && (
                  <p className="text-xs text-slate-500 break-all">{detailedLead.agentId.email}</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 space-y-1">
              <p>Created: {formatDate(detailedLead.createdAt)}</p>
              <p>Last Updated: {formatDate(detailedLead.updatedAt)}</p>
            </div>
          </div>

          {/* Right Column: Activity Timeline Feed */}
          <div className="flex flex-col lg:col-span-7 lg:border-l lg:border-slate-200 lg:pl-6">
            <h4 className="text-sm font-bold text-slate-900">Activity Timeline</h4>
            <p className="text-xs text-slate-500">
              History of stage transitions and agent notes.
            </p>

            {/* Add Note Input Form */}
            <form onSubmit={handleAddNote} className="mt-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log a call summary or follow-up note..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  disabled={addNoteMutation.isPending || !noteText.trim()}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </button>
              </div>
              {addNoteMutation.isError && (
                <p className="mt-1 text-[11px] text-red-600">
                  {addNoteMutation.error?.response?.data?.message || 'Failed to add note'}
                </p>
              )}
            </form>

            {/* Vertical Timeline Stream */}
            <div className="mt-5 flex-1 overflow-y-auto max-h-72 sm:max-h-80 pr-1">
              {isLoadingTimeline ? (
                <div className="flex py-12 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-xs font-medium text-slate-500">No activity recorded yet.</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Stage changes and added notes will appear here.
                  </p>
                </div>
              ) : (
                <ol className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
                  {activities.map((item, idx) => {
                    const actionType = item.actionType || 'Updated';
                    const isNote = actionType === 'Note Added';
                    const isCreated = actionType === 'Created';

                    const performerName =
                      item.userId?.name ||
                      detailedLead.agentId?.name ||
                      'System';

                    return (
                      <li key={item._id || idx} className="ml-5">
                        {/* Timeline Node Icon */}
                        <span
                          className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                            isNote
                              ? 'bg-amber-500 text-white'
                              : isCreated
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isNote ? (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          )}
                        </span>

                        {/* Timeline Card */}
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px] sm:max-w-xs">
                                {performerName}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                                  isNote
                                    ? 'bg-amber-100 text-amber-800'
                                    : isCreated
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {actionType}
                              </span>
                            </div>
                            <time className="text-[11px] text-slate-400 shrink-0">
                              {formatDate(item.createdAt)}
                            </time>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-700 leading-relaxed break-words">
                            {item.details}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              const currentLead = detailedLead;
              onClose();
              onEdit(currentLead);
            }}
            className="w-full sm:w-auto rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 cursor-pointer"
          >
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
}