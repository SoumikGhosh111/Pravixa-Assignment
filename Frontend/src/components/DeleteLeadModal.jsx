import { useDeleteLeadMutation } from '../hooks/useLeadQueries';

export default function DeleteLeadModal({ isOpen, onClose, lead }) {
  const deleteLeadMutation = useDeleteLeadMutation();

  if (!isOpen || !lead) return null;

  const handleConfirmDelete = () => {
    deleteLeadMutation.mutate(lead._id, {
      onSuccess: () => {
        onClose();
      },
    });
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
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Delete Lead</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-800">{lead.name}</span> (
              {lead.company || 'No company'})? This action cannot be undone.
            </p>
          </div>
        </div>

        {deleteLeadMutation.isError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {deleteLeadMutation.error?.response?.data?.message ||
              deleteLeadMutation.error?.message ||
              'Failed to delete lead'}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteLeadMutation.isPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteLeadMutation.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-red-700 disabled:opacity-60 cursor-pointer"
          >
            {deleteLeadMutation.isPending ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}