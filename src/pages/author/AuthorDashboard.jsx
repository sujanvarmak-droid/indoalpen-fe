import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubmissions } from '@/features/submissions/submissionThunks';
import { selectAllSubmissions } from '@/features/submissions/submissionsSlice';
import { SUBMISSION_STATUS } from '@/constants/submissionStatus';
import { PERMISSIONS } from '@/constants/permissions';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { StatusChip } from '@/components/ui/StatusChip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { formatDate } from '@/utils/formatDate';

const PAGE_SIZE = 10;

const AuthorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submissions = useSelector(selectAllSubmissions);
  const status = useSelector((state) => state.submissions.status);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    dispatch(fetchMySubmissions({ page, size: PAGE_SIZE })).then((result) => {
      if (fetchMySubmissions.fulfilled.match(result)) {
        setTotalElements(result.payload.totalElements ?? 0);
      }
    });
  }, [dispatch, page]);

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Submissions</h1>
        <PermissionGate permission={PERMISSIONS.SUBMIT_PAPER}>
          <Button variant="primary" onClick={() => navigate(ACCOUNT_ROUTES.AUTHOR_PROFILE)} fullWidth className="sm:w-auto">
            + New Submission
          </Button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <Skeleton variant="table-row" count={3} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center gap-4 text-center">
          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">No submissions yet.</p>
          <Button variant="primary" onClick={() => navigate(ACCOUNT_ROUTES.AUTHOR_PROFILE)} fullWidth className="sm:w-auto">
            Create your first submission
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {sub.title || <span className="text-gray-400 italic">Untitled</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sub.category || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={sub.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">v{sub.version}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(sub.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={sub.status !== SUBMISSION_STATUS.DRAFT}
                      onClick={() => navigate(ACCOUNT_ROUTES.EDIT_SUBMISSION(sub.id))}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setPage(i)}
              size="sm"
              variant={i === page ? 'primary' : 'ghost'}
              className={`min-w-9 ${
                i === page
                  ? ''
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;
