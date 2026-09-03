'use client';

import React, { useRef, useState } from 'react';
import { Video, Upload, X, Loader2, Sparkles, FileVideo } from 'lucide-react';

interface MotionAnalysisResult {
  motionDescriptor: string;
  keyMoments: string[];
  motionStyle: string;
  pacing: string;
  dominantJoints: string[];
  quality: number;
}

interface MotionVideoUploadProps {
  onMotionExtracted: (descriptor: string, result: MotionAnalysisResult) => void;
  targetEngine?: string;
  isExtracting: boolean;
  setIsExtracting: (v: boolean) => void;
}

export const MotionVideoUpload: React.FC<MotionVideoUploadProps> = ({
  onMotionExtracted,
  targetEngine,
  isExtracting,
  setIsExtracting,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_SIZE_MB = 15;

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, MOV, WEBM).');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(
        `Video too large (max ${MAX_SIZE_MB}MB). For larger videos, use the Manual Text tab — paste your Gemini-extracted motion descriptor there.`
      );
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleExtract = async () => {
    if (!videoFile) return;
    setIsExtracting(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const savedKey = localStorage.getItem('aisha_custom_gemini_key');
        const savedModel = localStorage.getItem('aisha_custom_gemini_model');
        if (savedKey) headers['x-gemini-api-key'] = savedKey;
        if (savedModel) headers['x-gemini-model'] = savedModel;

        const res = await fetch('/api/analyze-motion', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            videoDataUrl: dataUrl,
            videoMimeType: videoFile.type,
            targetEngine,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Motion extraction failed.');
        }
        const result: MotionAnalysisResult = await res.json();
        onMotionExtracted(result.motionDescriptor, result);
        setIsExtracting(false);
      };
      reader.readAsDataURL(videoFile);
    } catch (err) {
      setError((err as Error).message || 'Extraction failed. Try the Manual Text tab.');
      setIsExtracting(false);
    }
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {!videoFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all
            ${isDragging
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-zinc-700/80 bg-zinc-900/40 hover:border-violet-500/50 hover:bg-zinc-900/70'
            }`}
        >
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <FileVideo className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-200">Drop reference video here</p>
            <p className="text-xs text-zinc-500 mt-1">MP4, MOV, WEBM · Max {MAX_SIZE_MB}MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/mov,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-zinc-700/60 bg-zinc-900/40">
          <video
            src={videoPreviewUrl!}
            className="w-full h-36 object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Video className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="text-xs text-zinc-300 truncate font-medium">{videoFile.name}</span>
              <span className="text-xs text-zinc-500">
                ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
              </span>
            </div>
            <button
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 leading-relaxed">
          {error}
        </p>
      )}

      {videoFile && (
        <button
          onClick={handleExtract}
          disabled={isExtracting}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Motion with Gemini…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Extract Skeletal Motion →
            </>
          )}
        </button>
      )}

      <div className="p-2.5 rounded-xl bg-violet-950/20 border border-violet-500/10 text-[11px] text-zinc-500 leading-relaxed flex gap-2">
        <Upload className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
        <span>
          Gemini analyzes the motion and extracts a skeletal descriptor — ignoring original clothing and environment.
          For videos &gt;15MB, switch to <strong className="text-zinc-400">Manual Text</strong> and paste the descriptor from Gemini.google.com.
        </span>
      </div>
    </div>
  );
};
