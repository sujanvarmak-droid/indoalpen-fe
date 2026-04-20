import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { validateFile } from '@/utils/fileValidation';
import { setUploadProgress, setUploadStatus } from '@/features/submissions/submissionsSlice';
import { getPresignedUrl, attachFile } from '@/features/submissions/submissionThunks';
import { addToast } from '@/features/ui/uiSlice';

export const useFileUpload = () => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const upload = async (file, submissionId) => {
    setError(null);
    try {
      validateFile(file);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      dispatch(setUploadStatus({ submissionId, status: 'uploading' }));

      const { presignedUrl, objectUrl } = await dispatch(
        getPresignedUrl({ filename: file.name, contentType: file.type })
      ).unwrap();

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
          dispatch(setUploadProgress({ submissionId, progress: pct }));
        },
      });

      await dispatch(
        attachFile({
          submissionId,
          fileUrl: objectUrl,
          fileName: file.name,
          fileType: file.type,
        })
      ).unwrap();

      setStatus('done');
      dispatch(setUploadStatus({ submissionId, status: 'done' }));
      dispatch(addToast({ message: 'File uploaded successfully', type: 'success' }));
    } catch (err) {
      const msg = err.message ?? 'Upload failed';
      setError(msg);
      setStatus('error');
      dispatch(setUploadStatus({ submissionId, status: 'error' }));
      dispatch(addToast({ message: msg, type: 'error' }));
    }
  };

  const reset = () => {
    setProgress(0);
    setStatus('idle');
    setError(null);
  };

  return { upload, progress, status, error, reset };
};
