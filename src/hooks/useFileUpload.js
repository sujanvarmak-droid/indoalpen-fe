import { useState } from 'react';
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

      const { presignedUrl, s3Key } = await dispatch(
        getPresignedUrl({ fileName: file.name, contentType: file.type, publicationId: submissionId })
      ).unwrap();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
            dispatch(setUploadProgress({ submissionId, progress: pct }));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('S3 upload failed')));
        xhr.send(file);
      });

      await dispatch(
        attachFile({
          publicationId: submissionId,
          s3Key,
          fileName: file.name,
          contentType: file.type,
          fileType: 'MANUSCRIPT',
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
