import { Button } from '@/components/ui/Button';

export const DraftSubmissionsPanel = ({
  drafts = [],
  isLoading = false,
  onEditDraft,
  onStartNew,
  className = '',
}) => {
  const resolveDraftId = (draft) =>
    draft?.originalSubmissionId ?? draft?.submissionId ?? draft?.id ?? null;

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`.trim()}>
        <p className="text-sm text-gray-500">Loading your draft submissions...</p>
      </div>
    );
  }

  if (!drafts.length) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-amber-900">Continue your draft submissions</h2>
          <p className="text-xs text-amber-800">
            You already have {drafts.length} draft{drafts.length > 1 ? 's' : ''}. You can continue one of them or start a new submission.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onStartNew}>
          Start New
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {drafts.slice(0, 3).map((draft) => {
          const draftId = resolveDraftId(draft);

          return (
          <div
            key={draftId ?? draft.id}
            className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {draft.title || 'Untitled draft'}
              </p>
              <p className="text-xs text-gray-500">Submission ID: {draftId ?? 'N/A'}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (draftId) {
                  onEditDraft?.(draftId);
                }
              }}
            >
              Continue Draft
            </Button>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default DraftSubmissionsPanel;
