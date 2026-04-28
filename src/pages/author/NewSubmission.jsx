import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { useAuth } from '@/hooks/useAuth';
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
const AUTHOR_ROLE_IDS = {
  corresponding: '89ce84c5-e19d-4da1-9134-3748d6a040ab',
};
const ALLOWED_FLOW_EMAIL = 'sujanvarmak@gmail.com';
const FILE_TYPE_MAP = {
  manuscript: 'MANUSCRIPT',
  figures: 'FIGURE',
  video: 'VIDEO',
};
const FILE_EXTENSION_TO_CONTENT_TYPE = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

const resolveFileContentType = (file) => {
  const detectedType = String(file?.type ?? '').trim();
  if (detectedType) {
    return detectedType;
  }
  const extension = String(file?.name ?? '')
    .split('.')
    .pop()
    ?.toLowerCase();
  return FILE_EXTENSION_TO_CONTENT_TYPE[extension] ?? 'application/octet-stream';
};

export const NewSubmission = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [submissionId, setSubmissionId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const initializedRef = useRef(false);
  const uploadedFileIdsRef = useRef({});
  const requestedJournalCode =
    searchParams.get('journalSubTypeId') ?? searchParams.get('journalCode');
  const journalCode = ALLOWED_JOURNAL_CODES.includes(requestedJournalCode ?? '')
    ? requestedJournalCode
    : ALLOWED_JOURNAL_CODES[0];
  const canUseSubmissionFlow =
    String(user?.email ?? '')
      .trim()
      .toLowerCase() === ALLOWED_FLOW_EMAIL;

  useEffect(() => {
    if (!canUseSubmissionFlow) {
      setIsInitializing(false);
      return;
    }
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
  }, [canUseSubmissionFlow, journalCode]);

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
    const contentType = resolveFileContentType(file);
    const presign = await getPresignedUrl({
      fileName: file.name,
      contentType,
      publicationId: submissionId,
    });
    const presignedUrl =
      presign?.presignedUrl ??
      presign?.uploadUrl ??
      presign?.url ??
      null;
    const s3Key =
      presign?.s3Key ??
      presign?.key ??
      presign?.objectKey ??
      null;

    if (!presignedUrl || !s3Key) {
      throw new Error('Presigned URL response missing required fields.');
    }

    const axios = (await import('axios')).default;
    try {
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': contentType },
        onUploadProgress: (event) => {
          if (event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
    } catch (error) {
      // Browser blocks cross-origin S3 uploads on failed preflight/CORS and surfaces as network error.
      if (error && typeof error === 'object' && 'message' in error && String(error.message) === 'Network Error') {
        throw new Error(
          'S3 upload blocked by CORS/preflight. Please update bucket CORS to allow PUT from this frontend origin.'
        );
      }
      throw error;
    }

    const attachedFile = await attachFile({
      publicationId: submissionId,
      s3Key,
      fileName: file.name,
      contentType,
      fileType: FILE_TYPE_MAP[fieldId] ?? fieldId.toUpperCase(),
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

    return { objectUrl: presign?.fileUrl ?? presign?.objectUrl ?? s3Key, fileName: file.name };
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
          journalCode: stepData?.articleType ?? null,
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
            firstName: author?.firstName ?? '',
            lastName: author?.lastName ?? '',
            email: author?.email ?? '',
            affiliation: author?.affiliation ?? '',
            authorRoleId:
              author?.authorRoleId ??
              AUTHOR_ROLE_IDS[author?.role] ??
              author?.role ??
              '',
            isCorresponding:
              author?.role === 'corresponding' ||
              (author?.authorRoleId ?? AUTHOR_ROLE_IDS[author?.role] ?? '') === AUTHOR_ROLE_IDS.corresponding,
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

  if (!canUseSubmissionFlow) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">This submission flow is enabled only for {ALLOWED_FLOW_EMAIL}.</p>
        <button
          type="button"
          onClick={() => navigate(ACCOUNT_ROUTES.DASHBOARD)}
          className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
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
