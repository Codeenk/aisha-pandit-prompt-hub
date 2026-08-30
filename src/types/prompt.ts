export type StudioMode = 'image' | 'video';

export interface ImageReference {
  id: string;
  name: string;
  dataUrl: string; // base64 data url
  mimeType: string;
  size: number;
}

export type CompositionOption =
  | 'Auto'
  | 'Close-up'
  | 'Medium shot'
  | 'Full body'
  | 'Wide shot'
  | 'Editorial composition'
  | 'User specified';

export type CameraOption =
  | 'Auto'
  | 'Smartphone'
  | 'DSLR'
  | 'Mirrorless'
  | 'Cinematic'
  | 'Fashion editorial'
  | 'User specified';

export type LightingOption =
  | 'Auto'
  | 'Natural'
  | 'Golden hour'
  | 'Soft studio'
  | 'Hard sunlight'
  | 'Overcast'
  | 'Night'
  | 'User specified';

export type AspectRatioOption =
  | 'Auto'
  | '1:1'
  | '4:5'
  | '3:4'
  | '9:16'
  | '16:9';

export type VisualStyleOption =
  | 'Auto'
  | 'Photorealistic'
  | 'Fashion editorial'
  | 'Luxury campaign'
  | 'Social media'
  | 'Cinematic'
  | 'Lifestyle photography';

export interface ImageControls {
  composition: CompositionOption;
  customComposition?: string;
  camera: CameraOption;
  customCamera?: string;
  lighting: LightingOption;
  customLighting?: string;
  aspectRatio: AspectRatioOption;
  visualStyle: VisualStyleOption;
}

export type DurationOption =
  | 'Auto'
  | '5 seconds'
  | '8 seconds'
  | '10 seconds'
  | 'User specified';

export type CameraMovementOption =
  | 'Auto'
  | 'Static'
  | 'Slow push-in'
  | 'Pull-back'
  | 'Pan'
  | 'Tilt'
  | 'Handheld'
  | 'Tracking'
  | 'User specified';

export type MotionStyleOption =
  | 'Auto'
  | 'Natural'
  | 'Cinematic'
  | 'Social media'
  | 'Fashion'
  | 'Energetic'
  | 'Slow / elegant';

export type PacingOption =
  | 'Auto'
  | 'Slow'
  | 'Natural'
  | 'Energetic';

export type VideoTargetEngine =
  | 'Auto'
  | 'Google Veo (Structured Cinematic)'
  | 'Kling AI (Character & Physics)'
  | 'Runway Gen-3 (Kinetic Camera)'
  | 'ChatGPT / Sora (Strict Anti-Refusal)';

export interface VideoControls {
  duration: DurationOption;
  customDuration?: string;
  cameraMovement: CameraMovementOption;
  customCameraMovement?: string;
  motionStyle: MotionStyleOption;
  pacing: PacingOption;
  targetEngine?: VideoTargetEngine;
}

export interface PromptAnalysis {
  identity?: boolean;
  garment?: boolean;
  environment?: boolean;
  composition?: boolean;
  lighting?: boolean;
  motion?: boolean;
  photorealism?: boolean;
  summary?: string;
}

export interface PromptEngineResponse {
  prompt: string;
  negative_prompt?: string;
  physics_and_realism_anchors?: string[];
  quality_score: number;
  analysis: PromptAnalysis;
  tags?: string[];
  suggested_downstream_model?: string;
}

export interface HistoryItem {
  id: string;
  mode: StudioMode;
  prompt: string;
  quality_score: number;
  timestamp: number;
  creativeDirection: string;
  summary?: string;
  tags?: string[];
  thumbnail?: string; // thumbnail for preview
}

export type ModifyAction = 'regenerate' | 'improve' | 'shorten' | 'expand';
