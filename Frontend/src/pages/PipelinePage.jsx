import { useState } from 'react';
import { useLeadsQuery } from '../hooks/useLeadQueries';
import CreateLeadModal from '../components/CreateLeadModal';
import EditLeadModal from '../components/EditLeadModal';
import ViewLeadModal from '../components/ViewLeadModal';
import DeleteLeadModal from '../components/DeleteLeadModal';
import ConvertLeadModal from '../components/ConvertLeadModal';
import { useUpdateLeadStatusMutation } from '../hooks/useLeadQueries';

export default function PipelinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of rows per page

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [convertingLead, setConvertingLead] = useState(null);

  const updateStatusMutation = useUpdateLeadStatusMutation();
  const { data: leadsResponse, isLoading, isError, error } = useLeadsQuery();

  const leads = Array.isArray(leadsResponse)
    ? leadsResponse
    : Array.isArray(leadsResponse?.data)
      ? leadsResponse.data
      : leadsResponse?.data?.data || [];

  // 1. Filter leads by search term & stage dropdown filter
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      selectedStageFilter === 'ALL' || lead.stage === selectedStageFilter;

    return matchesSearch && matchesStage;
  });

  // 2. Pagination Calculations
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);

  const totalPipelineValue = leads
    .filter((l) => l.stage !== 'Won' && l.stage !== 'Lost')
    .reduce((acc, curr) => acc + (curr.expectedValue || 0), 0);

  const handleStageChange = (lead, newStage) => {
    if (newStage === 'Won') {
      setConvertingLead(lead);
      return;
    }
    updateStatusMutation.mutate({ leadId: lead._id, stage: newStage });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Leads</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pipeline Value</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-600">
            ₹{totalPipelineValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Deals Won</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600">
            {leads.filter((l) => l.stage === 'Won').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            {leads.length > 0
              ? `${Math.round((leads.filter((l) => l.stage === 'Won').length / leads.length) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Lead Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between border-b border-slate-200 p-4 sm:p-6 gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Sales Pipeline Leads</h2>

          {/* Search, Stage Filter & Create Button */}
          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search name, company, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full sm:w-64 rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />

            <select
              value={selectedStageFilter}
              onChange={(e) => {
                setSelectedStageFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on stage filter change
              }}
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Lead
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex py-20 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 text-sm">
            Failed to load pipeline leads: {error.message}
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No leads found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Lead / Company</th>
                    <th className="py-3.5 px-6">Contact Info</th>
                    <th className="py-3.5 px-6">Assigned Agent</th>
                    <th className="py-3.5 px-6">Value</th>
                    <th className="py-3.5 px-6">Stage</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.company || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900">{lead.email || 'No email'}</div>
                        <div className="text-xs text-slate-500">{lead.phone || 'No phone'}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {lead.agentId?.name || 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        ₹{lead.expectedValue?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          lead.stage === 'Won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          lead.stage === 'Lost' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                          {lead.stage || 'New'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={lead.stage || 'New'}
                            onChange={(e) => handleStageChange(lead, e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setViewingLead(lead)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingLead(lead)}
                            className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 sm:px-6 py-4 gap-4">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + pageSize, filteredLeads.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{filteredLeads.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                <span className="text-xs font-medium text-slate-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <ViewLeadModal
        isOpen={Boolean(viewingLead)}
        lead={viewingLead}
        onClose={() => setViewingLead(null)}
        onEdit={(leadToEdit) => setEditingLead(leadToEdit)}
      />
      <EditLeadModal
        isOpen={Boolean(editingLead)}
        lead={editingLead}
        onClose={() => setEditingLead(null)}
      />
      <DeleteLeadModal
        isOpen={Boolean(deletingLead)}
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
      />
      <ConvertLeadModal
        isOpen={Boolean(convertingLead)}
        lead={convertingLead}
        onClose={() => setConvertingLead(null)}
      />
    </div>
  );
}