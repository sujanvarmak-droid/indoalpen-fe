import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { useAuth } from '@/hooks/useAuth';
import { useMySubmissions } from '@/hooks/useMySubmissions';
import { DraftSubmissionsPanel } from '@/components/submission/DraftSubmissionsPanel';
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

function uploadToS3(presignedUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed: ${xhr.status}`));
    });
    xhr.addEventListener('error', () => reject(new Error('S3 upload failed')));
    xhr.send(file);
  });
}

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
const CORRESPONDING_AUTHOR_ROLE_ID = '89ce84c5-e19d-4da1-9134-3748d6a040ab';

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

const mapDraftToFlowData = (draft) => {
  if (!draft || typeof draft !== 'object') {
    return {};
  }

  const baseDraft =
    draft?.data && typeof draft.data === 'object'
      ? draft.data
      : draft;
  const versions = Array.isArray(baseDraft?.versions) ? baseDraft.versions : [];
  const latestVersion = versions.reduce((acc, version) => {
    if (!acc) return version;
    return Number(version?.version ?? 0) > Number(acc?.version ?? 0) ? version : acc;
  }, null);
  const mergedDraft =
    latestVersion && typeof latestVersion === 'object'
      ? { ...baseDraft, ...latestVersion }
      : baseDraft;
  const completedSteps = Array.isArray(mergedDraft?.completedSteps) ? mergedDraft.completedSteps : [];
  const completedStepIds = completedSteps
    .map((stepType) => {
      const normalized = String(stepType ?? '').toUpperCase();
      if (normalized === 'ARTICLE_TYPE') return 'article-type';
      if (normalized === 'AUTHOR_GUIDELINES') return 'author-guidelines';
      if (normalized === 'AUTHORS') return 'authors';
      if (normalized === 'MANUSCRIPT_DETAILS') return 'manuscript-details';
      if (normalized === 'FILE_UPLOAD') return 'files';
      if (normalized === 'SUGGEST_REVIEWERS') return 'reviewer-suggestion';
      if (normalized === 'ADDITIONAL_INFO') return 'additional-info';
      return null;
    })
    .filter(Boolean);
  const steps = Array.isArray(mergedDraft?.steps) ? mergedDraft.steps : [];
  const stepDataByType = steps.reduce((acc, step) => {
    const key = String(step?.stepType ?? step?.type ?? '').toUpperCase();
    if (!key) return acc;
    const rawData =
      step?.data && typeof step.data === 'object'
        ? step.data
        : step?.payload && typeof step.payload === 'object'
          ? step.payload
          : step?.value && typeof step.value === 'object'
            ? step.value
            : step;
    return { ...acc, [key]: rawData };
  }, {});
  const articleTypeData = stepDataByType.ARTICLE_TYPE ?? {};
  const authorGuidelinesData = stepDataByType.AUTHOR_GUIDELINES ?? {};
  const authorsData = stepDataByType.AUTHORS ?? {};
  const manuscriptData = stepDataByType.MANUSCRIPT_DETAILS ?? {};
  const fileUploadData = stepDataByType.FILE_UPLOAD ?? {};
  const reviewerData = stepDataByType.SUGGEST_REVIEWERS ?? {};
  const additionalInfoData = stepDataByType.ADDITIONAL_INFO ?? {};

  const authors = Array.isArray(mergedDraft.authors)
    ? mergedDraft.authors
    : Array.isArray(authorsData.authors)
      ? authorsData.authors
      : [];
  const suggestedReviewers = Array.isArray(mergedDraft.suggestedReviewers)
    ? mergedDraft.suggestedReviewers
    : Array.isArray(reviewerData.suggestedReviewers)
      ? reviewerData.suggestedReviewers
      : [];
  const files = Array.isArray(mergedDraft.files)
    ? mergedDraft.files
    : [
        ...(Array.isArray(mergedDraft.manuscriptFiles) ? mergedDraft.manuscriptFiles : []),
        ...(Array.isArray(mergedDraft.images) ? mergedDraft.images : []),
        ...(Array.isArray(mergedDraft.videos) ? mergedDraft.videos : []),
      ];
  const manuscriptFiles = Array.isArray(mergedDraft.manuscriptFiles) ? mergedDraft.manuscriptFiles : [];
  const imageFiles = Array.isArray(mergedDraft.images) ? mergedDraft.images : [];
  const videoFiles = Array.isArray(mergedDraft.videos) ? mergedDraft.videos : [];
  const findFileByType = (type) =>
    files.find((file) => String(file?.fileType ?? file?.type ?? '').toUpperCase() === type);
  const manuscriptFile = findFileByType('MANUSCRIPT');
  const videoFile = findFileByType('VIDEO');
  const figureFiles = files.filter(
    (file) => String(file?.fileType ?? file?.type ?? '').toUpperCase() === 'FIGURE'
  );
  const manuscriptUrl =
    manuscriptFile?.fileUrl ??
    manuscriptFile?.url ??
    manuscriptFiles[0]?.fileUrl ??
    manuscriptFiles[0]?.url ??
    mergedDraft.manuscriptUrl ??
    null;
  const videoUrl =
    videoFile?.fileUrl ??
    videoFile?.url ??
    videoFiles[0]?.fileUrl ??
    videoFiles[0]?.url ??
    mergedDraft.videoUrl ??
    null;
  const figureUrls = (
    figureFiles.map((file) => file?.fileUrl ?? file?.url).filter(Boolean).length
      ? figureFiles.map((file) => file?.fileUrl ?? file?.url).filter(Boolean)
      : imageFiles.map((file) => file?.fileUrl ?? file?.url).filter(Boolean).length
        ? imageFiles.map((file) => file?.fileUrl ?? file?.url).filter(Boolean)
      : Array.isArray(mergedDraft.figureUrls)
        ? mergedDraft.figureUrls
        : []
  );

  return {
    'article-type': {
      articleType:
        mergedDraft.journalCode ??
        articleTypeData.journalCode ??
        mergedDraft.articleType ??
        articleTypeData.articleType ??
        '',
    },
    'author-guidelines': {
      guidelinesAgreed:
        mergedDraft.agreed ||
        mergedDraft.authorGuidelinesAccepted ||
        authorGuidelinesData.agreed ||
        completedSteps.includes('AUTHOR_GUIDELINES')
          ? 'yes'
          : '',
    },
    authors: {
      authorList: authors.length
        ? authors.map((author) => ({
            email: author?.email ?? '',
            firstName: author?.firstName ?? String(author?.fullName ?? '').split(' ').slice(0, -1).join(' '),
            lastName: author?.lastName ?? String(author?.fullName ?? '').split(' ').slice(-1).join(' '),
            affiliation: author?.affiliation ?? '',
            role:
              author?.isCorresponding ||
              author?.authorRoleId === CORRESPONDING_AUTHOR_ROLE_ID ||
              String(author?.authorRoleName ?? '').toLowerCase().includes('corresponding')
                ? 'corresponding'
                : author?.role === 'submitting' ||
                    author?.authorRole === 'submitting' ||
                    String(author?.authorRoleName ?? '').toLowerCase().includes('submitting')
                  ? 'submitting'
                  : 'co-author',
          }))
        : [{ email: '', firstName: '', lastName: '', affiliation: '', role: '' }],
    },
    'manuscript-details': {
      manuscriptTitle: mergedDraft.title ?? manuscriptData.title ?? '',
      runningTitle: mergedDraft.runningTitle ?? manuscriptData.runningTitle ?? '',
      abstract: mergedDraft.abstract ?? mergedDraft.abstractText ?? manuscriptData.abstract ?? '',
      keywords: Array.isArray(mergedDraft.keywords)
        ? mergedDraft.keywords
        : Array.isArray(manuscriptData.keywords)
          ? manuscriptData.keywords
          : [],
      fundingSource: mergedDraft.fundingSource ?? manuscriptData.fundingSource ?? '',
      apcAgreed:
        mergedDraft.apcAgreed ||
        mergedDraft.apcAgreement ||
        manuscriptData.apcAgreed ||
        manuscriptData.apcAgreement
          ? 'yes'
          : '',
    },
    'reviewer-suggestion': {
      suggestedReviewers: suggestedReviewers.map((reviewer) => ({
        reviewerName: reviewer?.name ?? reviewer?.reviewerName ?? '',
        reviewerEmail: reviewer?.email ?? reviewer?.reviewerEmail ?? '',
        reviewerAffiliation: reviewer?.affiliation ?? reviewer?.reviewerAffiliation ?? '',
      })),
    },
    files: {
      manuscript: manuscriptUrl ?? fileUploadData.manuscriptUrl ?? '',
      figures:
        figureUrls.length > 0
          ? figureUrls
          : Array.isArray(fileUploadData.figureUrls)
            ? fileUploadData.figureUrls
            : [],
      video: videoUrl ?? fileUploadData.videoUrl ?? '',
    },
    'additional-info': {
      coverLetter:
        mergedDraft.coverLetter ??
        mergedDraft.additionalInfo?.coverLetter ??
        additionalInfoData.coverLetter ??
        '',
      declaration:
        mergedDraft.declaration === 'yes' ||
        mergedDraft.additionalInfo?.declaration === 'yes' ||
        additionalInfoData.declaration === 'yes'
          ? 'yes'
          : '',
    },
    __completedStepIds: completedStepIds,
  };
};

export const NewSubmission = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { drafts, status: submissionsStatus } = useMySubmissions({ page: 0, size: 20 });
  const [submissionId, setSubmissionId] = useState(null);
  const [initialFlowData, setInitialFlowData] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [startFreshRequested, setStartFreshRequested] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState(null);
  const initializedRef = useRef(false);
  const uploadedFileIdsRef = useRef({});
  const submissionIdRef = useRef(null);
  const requestedJournalCode =
    searchParams.get('journalSubTypeId') ?? searchParams.get('journalCode');
  const requestedDraftId = searchParams.get('draftId') ?? searchParams.get('submissionId');
  const activeDraftId = resumeDraftId ?? requestedDraftId;
  const journalCode = ALLOWED_JOURNAL_CODES.includes(requestedJournalCode ?? '')
    ? requestedJournalCode
    : ALLOWED_JOURNAL_CODES[0];
  const canUseSubmissionFlow =
    String(user?.email ?? '')
      .trim()
      .toLowerCase() === ALLOWED_FLOW_EMAIL;
  const shouldSelectDraftBeforeStart =
    drafts.length > 0 &&
    !startFreshRequested &&
    !activeDraftId;
  const isLoadingMySubmissions = submissionsStatus === 'loading';

  useEffect(() => {
    if (!canUseSubmissionFlow) {
      setIsInitializing(false);
      return;
    }
    if (isLoadingMySubmissions || shouldSelectDraftBeforeStart) {
      setIsInitializing(false);
      return;
    }
    const initKey = activeDraftId ?? '__fresh__';
    if (initializedRef.current === initKey) return;
    initializedRef.current = initKey;
    submissionIdRef.current = null;
    uploadedFileIdsRef.current = {};

    const initDraft = async () => {
      if (!activeDraftId) {
        setSubmissionId(null);
        setInitialFlowData({});
        setIsInitializing(false);
        return;
      }
      setIsInitializing(true);
      setInitError(null);
      try {
        const draftSubmission = await getSubmissionById(activeDraftId);
        setInitialFlowData(mapDraftToFlowData(draftSubmission));
        const resolvedSubmissionId =
          draftSubmission?.submissionId ??
          draftSubmission?.id ??
          draftSubmission?.originalSubmissionId ??
          draftSubmission?.data?.submissionId ??
          draftSubmission?.data?.id ??
          activeDraftId;
        submissionIdRef.current = resolvedSubmissionId;
        setSubmissionId(resolvedSubmissionId);
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
  }, [activeDraftId, canUseSubmissionFlow, isLoadingMySubmissions, journalCode, shouldSelectDraftBeforeStart]);

  const createSubmitFn = () => async (payload) => {
    const id = submissionIdRef.current ?? submissionId;
    if (!id) throw new Error('Submission ID is not available.');
    await updateDraft({ id, data: payload });
    return submitForReview(id);
  };

  const createUploadFn = () => async (file, fieldId, onProgress) => {
    const id = submissionIdRef.current ?? submissionId;
    if (!id) throw new Error('Submission ID is not available.');
    const contentType = resolveFileContentType(file);
    const presign = await getPresignedUrl({
      fileName: file.name,
      contentType,
      publicationId: id,
    });
    const presignedUrl =
      presign?.presignedUrl ??
      presign?.uploadUrl ??
      presign?.url ??
      null;
    const signedContentType =
      presign?.contentType ??
      presign?.mimeType ??
      contentType;

    if (!presignedUrl) {
      throw new Error('Presigned URL response missing upload URL.');
    }

    await uploadToS3(presignedUrl, file, signedContentType, onProgress);

    const s3Url =
      presign?.s3Key ??
      presign?.key ??
      presign?.objectKey ??
      presignedUrl.split('?')[0];

    const attachedFile = await attachFile({
      publicationId: id,
      s3Url,
      fileName: file.name,
      fileType: FILE_TYPE_MAP[fieldId] ?? fieldId.toUpperCase(),
      fileSizeBytes: file.size,
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

    return { objectUrl: presign?.fileUrl ?? presign?.objectUrl ?? s3Url, fileName: file.name };
  };

  const createSaveStepFn = () => async (stepId, stepData) => {
    const stepType = STEP_TYPE_MAP[stepId];
    if (!stepType) {
      return null;
    }

    if (stepType === 'ARTICLE_TYPE') {
      let currentId = submissionIdRef.current;
      if (!currentId) {
        const startedSubmission = await startSubmission({ journalCode });
        currentId = startedSubmission?.submissionId ?? startedSubmission?.id ?? null;
        if (!currentId) throw new Error('Submission started but submissionId is missing.');
        submissionIdRef.current = currentId;
        setSubmissionId(currentId);
      }
      return updateSubmissionStep({
        submissionId: currentId,
        stepType,
        data: {
          journalCode: stepData?.articleType ?? null,
        },
      });
    }

    const currentId = submissionIdRef.current ?? submissionId;
    if (!currentId) {
      throw new Error('Submission ID is not available.');
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
        submissionId: currentId,
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
        submissionId: currentId,
        stepType,
        data: {
          title: stepData?.manuscriptTitle ?? '',
          runningTitle: stepData?.runningTitle ?? '',
          abstractText: stepData?.abstract ?? '',
          keywords: Array.isArray(stepData?.keywords) ? stepData.keywords : [],
          fundingSource: stepData?.fundingSource ?? null,
          apcAgreement: stepData?.apcAgreed === 'yes',
        },
      });
    }

    if (stepType === 'FILE_UPLOAD') {
      const fileIds = Object.values(uploadedFileIdsRef.current).filter(Boolean);
      return updateSubmissionStep({
        submissionId: currentId,
        stepType,
        data: { fileIds },
      });
    }

    if (stepType === 'SUGGEST_REVIEWERS') {
      const reviewers = Array.isArray(stepData?.suggestedReviewers) ? stepData.suggestedReviewers : [];
      return updateSubmissionStep({
        submissionId: currentId,
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
        submissionId: currentId,
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
    const id = submissionIdRef.current ?? submissionId;
    if (!id) throw new Error('Submission ID is not available.');
    return getSubmissionById(id);
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

  if (isLoadingMySubmissions) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Checking your existing drafts...
      </div>
    );
  }

  if (shouldSelectDraftBeforeStart) {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4 sm:px-0">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Publish Journey</h1>
        <p className="text-sm text-gray-600 mb-5">
          You already have draft submissions. Continue a draft or start a new one.
        </p>
        <DraftSubmissionsPanel
          drafts={drafts}
          onStartNew={() => {
            setStartFreshRequested(true);
            setResumeDraftId(null);
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete('draftId');
              next.delete('submissionId');
              return next;
            });
          }}
          onEditDraft={(draftId) => {
            setResumeDraftId(draftId);
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('draftId', draftId);
              return next;
            });
          }}
        />
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
        initialFlowData={initialFlowData}
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
