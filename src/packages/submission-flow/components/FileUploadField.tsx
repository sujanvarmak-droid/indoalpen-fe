import { useRef, useState } from 'react';
import { UploadFieldConfig } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { cx } from './fields/_utils';
import { resolveEffectiveMimeType } from '../utils/fileMime';

interface FileUploadFieldProps {
  fieldConfig: UploadFieldConfig;
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9.3 14.3c-.1.4-.3.7-.5.9-.2.2-.4.3-.7.3-.1 0-.3 0-.4-.1-.1 0-.2-.1-.3-.2v1.2H7v-4h.5l.1.3c.1-.1.2-.2.4-.3.1-.1.3-.1.5-.1.3 0 .5.1.7.3.2.2.3.5.3.8v.9zm2.9.1c0 .3-.1.5-.2.7-.1.2-.3.4-.5.5-.2.1-.5.2-.8.2h-.9v-3.4h1c.3 0 .6.1.8.2.2.1.4.3.5.5.1.2.1.4.1.7v.6zm3.2-1.6h-1.2v.7h1.1v.5h-1.1v1.3h-.6v-3h1.8v.5z"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function ZipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM10 12h1v1h-1v-1zm1 1h1v1h-1v-1zm-1 1h1v1h-1v-1zm1 1h1v1h-1v-1zm1-4h1v1h-1v-1zm-1-1h1v1h-1v-1zm4 5h-2v1h-1v1h4v-1h-1v-1z"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function getFileTypeInfo(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return { icon: <PdfIcon />, iconColor: 'text-red-600', iconBg: 'bg-red-50 border-red-200', label: 'PDF' };
  if (['png', 'jpg', 'jpeg', 'tiff', 'gif', 'webp'].includes(ext)) return { icon: <ImageIcon />, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 border-blue-200', label: 'Image' };
  if (ext === 'zip') return { icon: <ZipIcon />, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-200', label: 'ZIP' };
  return { icon: <FileIcon />, iconColor: 'text-gray-500', iconBg: 'bg-gray-50 border-gray-200', label: 'File' };
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
      patch: { status: 'idle', progress: 0, objectUrl: null, fileName: null, error: null },
    });
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      return;
    }
    try {
      if (!resolveEffectiveMimeType(file, fieldConfig.mimeTypes)) {
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

      {status === 'done' ? (() => {
        const fileName = uploadState?.fileName ?? 'Uploaded';
        const { icon, iconColor, iconBg, label } = getFileTypeInfo(fileName);
        return (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className={cx('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border', iconBg, iconColor)}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{fileName}</p>
              <p className="text-xs text-emerald-600">{label} · Uploaded</p>
            </div>
            <button
              type="button"
              onClick={resetUpload}
              className="flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        );
      })() : null}

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
