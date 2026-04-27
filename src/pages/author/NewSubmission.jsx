import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import {
  attachFile,
  getSubmissionById,
  getPresignedUrl,
  startSubmission,
  submitForReview,
  updateSubmissionStep,
  updateDraft,
} from '@/services/submissionService';
import { SubmissionFlow } from '@/packages/submission-flow';
import { publishJourneyConfig } from '@/config/flows/publishJourneyConfig';

const ALLOWED_JOURNAL_CODES = [
  'GRA-RE',
  'ENG-INN-RES',
  'TRA-BIO-ENG',
  'HEA-IMP-RES',
  'DEN-IMP-RES',
  'MAN-STU',
  'SCI-FOR-KIDS',
];
const STEP_TYPE_MAP = {
  'article-type': 'ARTICLE_TYPE',
  'author-guidelines': 'AUTHOR_GUIDELINES',
  authors: 'AUTHORS',
  'manuscript-details': 'MANUSCRIPT_DETAILS',
  files: 'FILE_UPLOAD',
  'reviewer-suggestion': 'SUGGEST_REVIEWERS',
  'additional-info': 'ADDITIONAL_INFO',
};

export const NewSubmission = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [submissionId, setSubmissionId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const initializedRef = useRef(false);
  const uploadedFileIdsRef = useRef({});
  const requestedJournalCode = searchParams.get('journalCode');
  const journalCode = ALLOWED_JOURNAL_CODES.includes(requestedJournalCode ?? '')
    ? requestedJournalCode
    : ALLOWED_JOURNAL_CODES[0];

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initDraft = async () => {
      setIsInitializing(true);
      setInitError(null);
      try {
        const startedSubmission = await startSubmission({ journalCode });
        const startedSubmissionId = startedSubmission?.submissionId ?? startedSubmission?.id ?? null;
        if (!startedSubmissionId) {
          throw new Error('Submission started but submissionId is missing.');
        }
        setSubmissionId(startedSubmissionId);
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Failed to start submission journey.';
        setInitError(message);
      } finally {
        setIsInitializing(false);
      }
    };

    void initDraft();
  }, [journalCode]);

  const createSubmitFn = () => async (payload) => {
    if (!submissionId) {
      throw new Error('Submission ID is not available.');
    }
    await updateDraft({ id: submissionId, data: payload });
    return submitForReview(submissionId);
  };

  const createUploadFn = () => async (file, fieldId, onProgress) => {
    if (!submissionId) {
      throw new Error('Submission ID is not available.');
    }
    const { presignedUrl, objectUrl } = await getPresignedUrl({
      filename: file.name,
      contentType: file.type,
    });

    const axios = (await import('axios')).default;
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    const attachedFile = await attachFile({
      submissionId,
      fileUrl: objectUrl,
      fileName: file.name,
      fileType: fieldId,
    });

    const uploadedFileId =
      attachedFile?.fileId ??
      attachedFile?.id ??
      attachedFile?.data?.fileId ??
      attachedFile?.data?.id ??
      null;

    if (uploadedFileId) {
      uploadedFileIdsRef.current[fieldId] = String(uploadedFileId);
    }

    return { objectUrl, fileName: file.name };
  };

  const createSaveStepFn = () => async (stepId, stepData) => {
    if (!submissionId) {
      throw new Error('Submission ID is not available.');
    }

    const stepType = STEP_TYPE_MAP[stepId];
    if (!stepType) {
      return null;
    }

    if (stepType === 'ARTICLE_TYPE') {
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          journalSubTypeId: stepData?.articleType ?? null,
        },
      });
    }

    if (stepType === 'AUTHOR_GUIDELINES') {
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          agreed: stepData?.guidelinesAgreed === 'yes',
        },
      });
    }

    if (stepType === 'AUTHORS') {
      const authorList = Array.isArray(stepData?.authorList) ? stepData.authorList : [];
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          authors: authorList.map((author) => ({
            fullName: `${author?.firstName ?? ''} ${author?.lastName ?? ''}`.trim(),
            email: author?.email ?? '',
            affiliation: author?.affiliation ?? '',
            roleId: author?.role ?? '',
            isCorresponding: author?.role === 'corresponding',
          })),
        },
      });
    }

    if (stepType === 'MANUSCRIPT_DETAILS') {
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          title: stepData?.manuscriptTitle ?? '',
          abstract: stepData?.abstract ?? '',
          keywords: Array.isArray(stepData?.keywords) ? stepData.keywords : [],
        },
      });
    }

    if (stepType === 'FILE_UPLOAD') {
      const fileIds = Object.values(uploadedFileIdsRef.current).filter(Boolean);
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: { fileIds },
      });
    }

    if (stepType === 'SUGGEST_REVIEWERS') {
      const reviewers = Array.isArray(stepData?.suggestedReviewers) ? stepData.suggestedReviewers : [];
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          suggestedReviewers: reviewers.map((reviewer) => ({
            name: reviewer?.reviewerName ?? '',
            email: reviewer?.reviewerEmail ?? '',
            affiliation: reviewer?.reviewerAffiliation ?? '',
            reason: reviewer?.reason ?? '',
          })),
        },
      });
    }

    if (stepType === 'ADDITIONAL_INFO') {
      return updateSubmissionStep({
        submissionId,
        stepType,
        data: {
          coverLetter: stepData?.coverLetter ?? '',
          conflictsOfInterest:
            stepData?.conflictsOfInterest ??
            (stepData?.declaration === 'yes' ? 'None' : ''),
          fundingStatement: stepData?.fundingStatement ?? '',
        },
      });
    }

    return null;
  };

  const createLoadReviewFn = () => async () => {
    if (!submissionId) {
      throw new Error('Submission ID is not available.');
    }
    return getSubmissionById(submissionId);
  };

  const handleSuccess = () => {
    dispatch(addToast({ message: 'Manuscript submitted successfully!', type: 'success' }));
    navigate(ACCOUNT_ROUTES.DASHBOARD);
  };

  if (isInitializing) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Preparing your submission...
      </div>
    );
  }

  if (initError) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">{initError}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <SubmissionFlow
        mode="inline"
        config={publishJourneyConfig}
        submitFn={createSubmitFn()}
        saveStep={createSaveStepFn()}
        loadReview={createLoadReviewFn()}
        uploadFile={createUploadFn()}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ACCOUNT_ROUTES.DASHBOARD)}
        labels={{
          nextButton: 'Next →',
          backButton: '← Back',
          submitButton: 'Submit Manuscript',
        }}
      />
    </div>
  );
};

export default NewSubmission;
