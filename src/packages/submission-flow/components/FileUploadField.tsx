import { useRef, useState } from 'react';
import { UploadFieldConfig } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { cx } from './fields/_utils';

interface FileUploadFieldProps {
  fieldConfig: UploadFieldConfig;
}

export function FileUploadField({ fieldConfig }: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { state, dispatch, runtime } = useFlowContext();
  const uploadState = state.uploadState[fieldConfig.id];
  const status = uploadState?.status ?? 'idle';
  const progress = uploadState?.progress ?? 0;

  const resetUpload = () => {
    dispatch({
      type: 'SET_UPLOAD',
      fieldId: fieldConfig.id,
      patch: { status: 'idle', progress: 0, objectUrl: null, fileName: null, fileId: null, error: null },
    });
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      return;
    }
    try {
      if (!fieldConfig.mimeTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${fieldConfig.mimeTypes.join(', ')}`);
      }
      if (file.size / 1024 / 1024 > fieldConfig.maxMb) {
        throw new Error(`File too large. Max size is ${fieldConfig.maxMb} MB`);
      }

      dispatch({
        type: 'SET_UPLOAD',
        fieldId: fieldConfig.id,
        patch: {
          status: 'uploading',
          progress: 0,
          error: null,
          fileName: file.name,
          objectUrl: null,
          fileId: null,
        },
      });

      const result = await runtime.uploadFile(file, fieldConfig.id, (percent) => {
        dispatch({
          type: 'SET_UPLOAD',
          fieldId: fieldConfig.id,
          patch: { progress: Math.max(0, Math.min(100, percent)) },
        });
      });

      dispatch({
        type: 'SET_UPLOAD',
        fieldId: fieldConfig.id,
        patch: {
          status: 'done',
          progress: 100,
          objectUrl: result.objectUrl,
          fileName: result.fileName,
          fileId: result.fileId ?? null,
          error: null,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_UPLOAD',
        fieldId: fieldConfig.id,
        patch: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      });
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">{fieldConfig.label}</h3>
        {fieldConfig.required ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Required</span>
        ) : null}
      </div>
      {fieldConfig.hint ? <p className="mb-3 text-xs leading-5 text-gray-500">{fieldConfig.hint}</p> : null}

      {status === 'done' ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
          <p className="text-sm text-green-700">✓ {uploadState?.fileName ?? 'Uploaded'}</p>
          <button type="button" onClick={resetUpload} className="text-sm text-green-700 underline hover:text-green-900">
            Remove
          </button>
        </div>
      ) : null}

      {status === 'uploading' ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700">
            Uploading... <span className="font-medium">{progress}%</span>
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-brand-light transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {(status === 'idle' || status === 'error') && (
        <div>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const droppedFile = event.dataTransfer.files?.[0];
              if (droppedFile) {
                void handleUpload(droppedFile);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cx(
              'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors',
              isDragging ? 'border-brand-light bg-brand-muted/40' : 'border-gray-300 hover:border-brand-light'
            )}
          >
            <p className="text-2xl text-gray-400">↑</p>
            <p className="mt-2 text-sm text-gray-700">Drag file here or click to browse</p>
            <p className="mt-1 text-xs text-gray-500">Accepted: {fieldConfig.mimeTypes.join(', ')}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept={fieldConfig.mimeTypes.join(',')}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) {
                void handleUpload(selectedFile);
              }
              event.currentTarget.value = '';
            }}
          />
        </div>
      )}

      {status === 'error' && uploadState?.error ? (
        <p className="mt-2 text-sm text-red-600">{uploadState.error}</p>
      ) : null}
    </section>
  );
}
