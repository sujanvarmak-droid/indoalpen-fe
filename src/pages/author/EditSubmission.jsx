import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMySubmissions,
  updateDraft,
  submitForReview,
} from '@/features/submissions/submissionThunks';
import { selectSubmissionById } from '@/features/submissions/submissionsSlice';
import { addToast } from '@/features/ui/uiSlice';
import { SUBMISSION_STATUS } from '@/constants/submissionStatus';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { SubmissionForm } from '@/components/submission/SubmissionForm';
import { FileUploader } from '@/components/submission/FileUploader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusChip } from '@/components/ui/StatusChip';
import { Skeleton } from '@/components/ui/Skeleton';

const EditSubmission = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submission = useSelector((state) => selectSubmissionById(state, id));
  const submissionsStatus = useSelector((state) => state.submissions.status);

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!submission) {
      dispatch(fetchMySubmissions({ page: 0, size: 50 }));
    }
  }, [dispatch, submission]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    await dispatch(updateDraft({ id, formData }));
    setIsSaving(false);
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    const result = await dispatch(submitForReview(id));
    setIsSubmitting(false);
    setShowConfirmModal(false);
    if (submitForReview.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Paper submitted for review!', type: 'success' }));
      navigate(ACCOUNT_ROUTES.DASHBOARD, { replace: true });
    } else {
      dispatch(addToast({ message: 'Submission failed. Please try again.', type: 'error' }));
    }
  };

  if (submissionsStatus === 'loading' && !submission) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton variant="text" count={5} />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center gap-4 mt-20 text-center">
        <p className="text-gray-500">Submission not found.</p>
        <Button variant="primary" onClick={() => navigate(ACCOUNT_ROUTES.DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (submission.status !== SUBMISSION_STATUS.DRAFT) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800 flex-1">
              {submission.title || 'Untitled'}
            </h2>
            <StatusChip status={submission.status} />
          </div>
          <p className="text-sm text-gray-600">
            This submission has been submitted and can no longer be edited.
          </p>
          <Button variant="secondary" onClick={() => navigate(ACCOUNT_ROUTES.DASHBOARD)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Edit Submission</h1>
        <StatusChip status={submission.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SubmissionForm
          defaultValues={submission}
          onSave={handleSave}
          isSaving={isSaving}
          submissionId={id}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUploader submissionId={id} existingFiles={submission.files ?? []} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => handleSave(submission)} loading={isSaving}>
          Save Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
        >
          Submit for Review
        </Button>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit for Review"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Once submitted, you cannot edit this paper. Are you sure you want to continue?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitForReview}
            loading={isSubmitting}
          >
            Confirm Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EditSubmission;
