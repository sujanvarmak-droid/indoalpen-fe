import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthStatus, selectCurrentUser } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { canAccessSubmissionFlow, SUBMISSION_FLOW_TEST_EMAIL } from '@/constants/submissionFlowAccess';
import { api } from '@/services/api';
import { getSubmissionById, startSubmission, updateSubmissionStep } from '@/services/submissionService';
import { SubmissionFlow } from '@/packages/submission-flow';
import { publishJourneyConfig } from '@/config/flows/publishJourneyConfig';

const DEFAULT_JOURNAL_CODE = 'JRNL-001';
const ARTICLE_TYPE_STEP = 'ARTICLE_TYPE';
const AUTHOR_GUIDELINES_STEP = 'AUTHOR_GUIDELINES';
const AUTHORS_STEP = 'AUTHORS';
const MANUSCRIPT_DETAILS_STEP = 'MANUSCRIPT_DETAILS';
const FILE_UPLOAD_STEP = 'FILE_UPLOAD';
const SUGGEST_REVIEWERS_STEP = 'SUGGEST_REVIEWERS';
const ADDITIONAL_INFO_STEP = 'ADDITIONAL_INFO';

const mapAuthorsPayload = (authorList = []) => ({
  authors: authorList.map((author) => {
    const firstName = String(author?.firstName ?? '').trim();
    const lastName = String(author?.lastName ?? '').trim();
    return {
      fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
      email: author?.email ?? '',
      affiliation: author?.affiliation ?? '',
      roleId: author?.role ?? '',
      isCorresponding: author?.role === 'corresponding',
    };
  }),
});

const FILE_TYPE_MAP = {
  manuscript: 'MANUSCRIPT',
  figures: 'FIGURE',
  video: 'VIDEO',
};

const extractSubmissionId = (payload) =>
  payload?.submissionId ?? payload?.id ?? payload?.data?.submissionId ?? payload?.data?.id ?? null;

const extractPresignedData = (payload) => ({
  presignedUrl: payload?.presignedUrl ?? payload?.uploadUrl ?? payload?.url ?? null,
  s3Key: payload?.s3Key ?? payload?.key ?? payload?.objectKey ?? null,
});

const createSubmitFn = (submissionId) => async (payload) => {
  const response = await api.post(`/submissions/${submissionId}/submit`, payload);
  return response.data;
};

const createFetchReviewDataFn = (submissionId) => async () => {
  if (!submissionId) return null;
  return getSubmissionById(submissionId);
};

const createUploadFn = (submissionId) => async (file, fieldId, onProgress) => {
  const fileType = FILE_TYPE_MAP[fieldId] ?? 'SUPPLEMENTARY';

  const presignedResponse = await api.get('/files/presigned-url', {
    params: { fileName: file.name, contentType: file.type, publicationId: submissionId },
  });
  const { presignedUrl, s3Key } = extractPresignedData(presignedResponse.data);
  if (!presignedUrl) {
    throw new Error('Presigned upload URL not received from server');
  }

  const axios = (await import('axios')).default;
  await axios.put(presignedUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  const attachResponse = await api.post('/files/attach', {
    publicationId: submissionId,
    s3Key,
    fileName: file.name,
    contentType: file.type,
    fileType,
  });

  const attached = attachResponse.data;
  return {
    objectUrl: attached?.fileUrl ?? attached?.objectUrl ?? attached?.s3Key ?? s3Key ?? file.name,
    fileName: attached?.fileName ?? file.name,
    fileId: attached?.id != null ? String(attached.id) : null,
  };
};

export const NewSubmission = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const authStatus = useSelector(selectAuthStatus);
  const [submissionId, setSubmissionId] = useState(null);
  const [isStarting, setIsStarting] = useState(true);

  const handleSuccess = () => {
    dispatch(addToast({ message: 'Manuscript submitted successfully!', type: 'success' }));
    navigate(ACCOUNT_ROUTES.DASHBOARD);
  };

  const handleStepComplete = async ({ stepId, data, flowData }) => {
    if (!submissionId) return;

    try {
      if (stepId === 'author-guidelines') {
        await updateSubmissionStep({
          id: submissionId,
          step: AUTHOR_GUIDELINES_STEP,
          data: { agreed: data?.guidelinesAgreed === 'yes' },
        });
      }
      if (stepId === 'authors') {
        await updateSubmissionStep({
          id: submissionId,
          step: AUTHORS_STEP,
          data: mapAuthorsPayload(data?.authorList),
        });
      }
      if (stepId === 'manuscript-details') {
        await updateSubmissionStep({
          id: submissionId,
          step: MANUSCRIPT_DETAILS_STEP,
          data: {
            title: data?.manuscriptTitle ?? '',
            abstract: data?.abstract ?? '',
            keywords: Array.isArray(data?.keywords) ? data.keywords : [],
          },
        });
      }
      if (stepId === 'files') {
        const fileIds = ['manuscriptFileId', 'figuresFileId', 'videoFileId']
          .map((key) => data?.[key])
          .filter((value) => typeof value === 'string' && value.length > 0);
        await updateSubmissionStep({
          id: submissionId,
          step: FILE_UPLOAD_STEP,
          data: { fileIds },
        });
      }
      if (stepId === 'reviewer-suggestion') {
        const suggestedReviewers = Array.isArray(data?.suggestedReviewers)
          ? data.suggestedReviewers
              .filter((reviewer) =>
                [reviewer?.reviewerName, reviewer?.reviewerEmail, reviewer?.reviewerAffiliation, reviewer?.reviewerReason]
                  .some((value) => String(value ?? '').trim().length > 0)
              )
              .map((reviewer) => ({
                name: reviewer?.reviewerName ?? '',
                email: reviewer?.reviewerEmail ?? '',
                affiliation: reviewer?.reviewerAffiliation ?? '',
                reason: reviewer?.reviewerReason ?? '',
              }))
          : [];

        await updateSubmissionStep({
          id: submissionId,
          step: SUGGEST_REVIEWERS_STEP,
          data: { suggestedReviewers },
        });
      }
      if (stepId === 'additional-info') {
        await updateSubmissionStep({
          id: submissionId,
          step: ADDITIONAL_INFO_STEP,
          data: {
            coverLetter: data?.coverLetter ?? '',
            conflictsOfInterest: data?.conflictsOfInterest ?? '',
            fundingStatement: flowData?.['manuscript-details']?.fundingSource ?? '',
          },
        });
      }
    } catch (error) {
      dispatch(
        addToast({
          message: error?.response?.data?.message ?? 'Could not save this step. Please try again.',
          type: 'error',
        })
      );
      throw error;
    }
  };

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!canAccessSubmissionFlow(user?.email)) {
      dispatch(
        addToast({
          message: `Submission flow is currently enabled only for ${SUBMISSION_FLOW_TEST_EMAIL}.`,
          type: 'error',
        })
      );
      navigate(ACCOUNT_ROUTES.DASHBOARD, { replace: true });
      return;
    }

    const beginSubmission = async () => {
      setIsStarting(true);
      try {
        const response = await startSubmission({ journalCode: DEFAULT_JOURNAL_CODE });
        const startedSubmissionId = extractSubmissionId(response);
        if (!startedSubmissionId) {
          throw new Error('Start submission API did not return an id');
        }
        await updateSubmissionStep({
          id: startedSubmissionId,
          step: ARTICLE_TYPE_STEP,
          data: { articleTypeId: '' },
        });
        setSubmissionId(startedSubmissionId);
      } catch (error) {
        dispatch(
          addToast({
            message: error?.response?.data?.message ?? 'Unable to start submission journey. Please try again.',
            type: 'error',
          })
        );
        navigate(ACCOUNT_ROUTES.DASHBOARD, { replace: true });
      } finally {
        setIsStarting(false);
      }
    };

    beginSubmission();
  }, [authStatus, dispatch, navigate, user?.email]);

  const submitFn = useMemo(() => {
    if (!submissionId) return null;
    return createSubmitFn(submissionId);
  }, [submissionId]);

  if (isStarting) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
          Starting submission journey...
        </div>
      </div>
    );
  }

  if (!submitFn) {
    return null;
  }

  return (
    <div className="py-6">
      <SubmissionFlow
        mode="inline"
        config={publishJourneyConfig}
        submitFn={submitFn}
        fetchReviewData={createFetchReviewDataFn(submissionId)}
        onStepComplete={handleStepComplete}
        uploadFile={createUploadFn(submissionId)}
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
