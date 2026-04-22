import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '@/features/ui/uiSlice';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { api } from '@/services/api';
import { SubmissionFlow } from '@/packages/submission-flow';
import { publishJourneyConfig } from '@/config/flows/publishJourneyConfig';

const createSubmitFn = () => async (payload) => {
  const response = await api.post('/submissions', payload);
  return response.data;
};

const createUploadFn = () => async (file, _fieldId, onProgress) => {
  const {
    data: { presignedUrl, objectUrl },
  } = await api.get('/submissions/presigned-url', {
    params: { filename: file.name, contentType: file.type },
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

  return { objectUrl, fileName: file.name };
};

export const NewSubmission = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSuccess = () => {
    dispatch(addToast({ message: 'Manuscript submitted successfully!', type: 'success' }));
    navigate(ACCOUNT_ROUTES.DASHBOARD);
  };

  return (
    <div className="py-6">
      <SubmissionFlow
        mode="inline"
        config={publishJourneyConfig}
        submitFn={createSubmitFn()}
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
