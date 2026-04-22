import { useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ACCEPTED_MIME_TYPES } from '@/utils/fileValidation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const FileUploader = ({ submissionId, existingFiles = [] }) => {
  const { upload, progress, status, error, reset } = useFileUpload();
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) upload(file, submissionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      upload(file, submissionId);
      e.target.value = '';
    }
  };

  const handleZoneClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-700">Supplementary Files</h3>

      {existingFiles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {existingFiles.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
            >
              <svg
                className="h-4 w-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-gray-700 flex-1 truncate">
                {file.fileName ?? file.name ?? 'Attached file'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleZoneClick}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2',
          'cursor-pointer transition-colors',
          status === 'uploading'
            ? 'border-brand-light bg-brand-muted/50 pointer-events-none'
            : 'border-gray-300 hover:border-brand-light hover:bg-brand-muted/30'
        )}
      >
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-brand">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400">PDF, Word, Images, Video (up to 500 MB)</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_MIME_TYPES}
          onChange={handleInputChange}
        />
      </div>

      {status === 'uploading' && (
        <ProgressBar progress={progress} label="Uploading..." />
      )}

      {status === 'done' && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-success">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          File uploaded successfully.
          <Button
            type="button"
            onClick={reset}
            variant="ghost"
            size="sm"
            className="px-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Upload another
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-danger flex items-center gap-1">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
