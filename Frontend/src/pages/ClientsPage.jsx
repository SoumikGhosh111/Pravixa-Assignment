import { useState } from 'react';
import { useLeadsQuery } from '../hooks/useLeadQueries';
import ViewLeadModal from '../components/ViewLeadModal';
import EditLeadModal from '../components/EditLeadModal';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Clients per page

  const [viewingClient, setViewingClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const { data: leadsResponse, isLoading, isError, error } = useLeadsQuery();

  const leads = Array.isArray(leadsResponse)
    ? leadsResponse
    : Array.isArray(leadsResponse?.data)
      ? leadsResponse.data
      : leadsResponse?.data?.data || [];

  // 1. Filter only Converted Clients (Won stage or isClient flag)
  const allClients = leads.filter(
    (lead) => lead.stage === 'Won' || lead.isClient === true
  );

  // 2. Filter by search term (Client Name, Company, Project Name, Email)
  const filteredClients = allClients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(term) ||
      client.company?.toLowerCase().includes(term) ||
      client.projectName?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term)
    );
  });

  // 3. Pagination Calculations
  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + pageSize);

  // KPI Calculations
  const totalAgreedRevenue = allClients.reduce(
    (acc, curr) => acc + (curr.agreedAmount || curr.expectedValue || 0),
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Active Clients</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{allClients.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Agreed Revenue</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600">
            ₹{totalAgreedRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Avg. Project Value</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-600">
            ₹{allClients.length > 0
              ? Math.round(totalAgreedRevenue / allClients.length).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* Clients & Projects Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 p-4 sm:p-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Clients & Projects</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Converted leads with active project scopes and agreed budgets
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search client, company, project..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex py-20 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 text-sm">
            Failed to load clients: {error?.message}
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No converted clients found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Client / Company</th>
                    <th className="py-3.5 px-6">Project Name & Scope</th>
                    <th className="py-3.5 px-6">Account Manager</th>
                    <th className="py-3.5 px-6">Agreed Budget</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedClients.map((client) => (
                    <tr key={client._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{client.name}</div>
                        <div className="text-xs text-slate-500">{client.company || 'N/A'}</div>
                        <div className="text-xs text-slate-400 break-all">{client.email}</div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-semibold text-indigo-600">
                          {client.projectName || 'General Retainer'}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {client.projectDetails || 'No scope description provided.'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {client.agentId?.name || 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        ₹{(client.agreedAmount || client.expectedValue || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingClient(client)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingClient(client)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                          >
                            Edit
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
                  {Math.min(startIndex + pageSize, filteredClients.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{filteredClients.length}</span> clients
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

      {/* Modals for viewing/editing client details */}
      <ViewLeadModal
        isOpen={Boolean(viewingClient)}
        lead={viewingClient}
        onClose={() => setViewingClient(null)}
        onEdit={(clientToEdit) => setEditingClient(clientToEdit)}
      />
      <EditLeadModal
        isOpen={Boolean(editingClient)}
        lead={editingClient}
        onClose={() => setEditingClient(null)}
      />
    </div>
  );
}