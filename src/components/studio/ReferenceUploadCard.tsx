'use client';

import React, { useRef, useState } from 'react';
import { ImageReference } from '@/types/prompt';
import {
  validateImageFile,
  processAndOptimizeImage,
  createSampleImage,
} from '@/lib/validation/image-utils';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ReferenceUploadCardProps {
  label: string;
  description: string;
  isRequired?: boolean;
  value?: ImageReference | null;
  onChange: (image: ImageReference | null) => void;
  sampleType?: 'model' | 'fashion' | 'location' | 'video-source';
  sampleLabel?: string;
  hasError?: boolean;
  errorMessage?: string;
}

export const ReferenceUploadCard: React.FC<ReferenceUploadCardProps> = ({
  label,
  description,
  isRequired = false,
  value,
  onChange,
  sampleType,
  sampleLabel = 'Try Sample Reference',
  hasError = false,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setValidationError(null);
    const val = validateImageFile(file);
    if (!val.valid) {
      setValidationError(val.error || 'Invalid image file.');
      return;
    }

    try {
      setIsProcessing(true);
      const processed = await processAndOptimizeImage(file);
      onChange(processed);
    } catch (err: unknown) {
      const error = err as Error;
      setValidationError(error.message || 'Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUseSample = () => {
    if (!sampleType) return;
    try {
      const sample = createSampleImage(sampleType);
      onChange(sample);
      setValidationError(null);
    } catch (err) {
      console.error('Failed to create sample image:', err);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        hasError || validationError
          ? 'border-rose-500/60 bg-rose-950/10'
          : value
          ? 'border-zinc-750 bg-zinc-900/60 shadow-lg'
          : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700/80'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-4.5 border-b border-zinc-800/60 bg-zinc-950/40 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-100">{label}</h4>
            {isRequired ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Required
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</p>
        </div>

        {/* Quick Sample Button if empty */}
        {!value && sampleType && (
          <button
            type="button"
            onClick={handleUseSample}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">{sampleLabel}</span>
            <span className="sm:hidden">Sample</span>
          </button>
        )}
      </div>

      {/* Upload Zone / Preview Area */}
      <div className="p-4">
        {value ? (
          /* Preview State */
          <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80">
            <div className="flex items-center justify-center bg-zinc-950 min-h-[160px] max-h-[220px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.dataUrl}
                alt={value.name}
                className="w-full h-full object-contain max-h-[220px] transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>

            {/* Bottom Floating Bar */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex items-center justify-between gap-2 backdrop-blur-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-zinc-200 truncate">{value.name}</span>
                <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                  ({(value.size / 1024).toFixed(0)} KB)
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace Image"
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  title="Remove Image"
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-700/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Dropzone State */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/20 shadow-inner'
                : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-xs font-medium text-zinc-300">Processing & optimizing image...</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 mb-2">
                  {isDragging ? (
                    <Upload className="w-5 h-5 text-indigo-400 animate-bounce" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <p className="text-xs font-semibold text-zinc-200">
                  <span className="text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">JPG, PNG, WEBP (up to 20MB)</p>
              </>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(validationError || errorMessage) && (
          <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 px-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError || errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
