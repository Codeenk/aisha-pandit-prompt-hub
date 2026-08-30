import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  getModelIdentifier,
  dataUrlToGenerativePart,
  parseStructuredResponse,
} from '@/lib/gemini/client';
import { VIDEO_PROMPT_SYSTEM_INSTRUCTION } from '@/lib/gemini/system-prompts';
import { ImageReference, VideoControls } from '@/types/prompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceImage,
      creativeDirection,
      controls,
    }: {
      sourceImage?: ImageReference;
      creativeDirection?: string;
      controls?: VideoControls;
    } = body;

    // 1. Validation
    if (!sourceImage || !sourceImage.dataUrl) {
      return NextResponse.json(
        { error: 'Source image required. Please upload the final image to animate.' },
        { status: 400 }
      );
    }

    if (!creativeDirection || !creativeDirection.trim()) {
      return NextResponse.json(
        { error: 'Tell us what should happen in the video. Describe action, movement, or emotion.' },
        { status: 400 }
      );
    }

    // 2. Client & Model Configuration
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const customModel = req.headers.get('x-gemini-model') || undefined;

    let genAI;
    try {
      genAI = getGeminiClient(customApiKey);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'GEMINI_API_KEY_MISSING') {
        return NextResponse.json(
          {
            error:
              'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file or enter your API key in Settings.',
          },
          { status: 401 }
        );
      }
      throw err;
    }

    const modelName = getModelIdentifier(customModel);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: VIDEO_PROMPT_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    // 3. Assemble Multimodal Parts
    const contents: (string | ReturnType<typeof dataUrlToGenerativePart>)[] = [];

    // Source image
    contents.push('--- SOURCE IMAGE (VISUAL SOURCE OF TRUTH) ---');
    contents.push('This is the starting frame. The video generation MUST maintain 100% visual consistency with the subject identity, outfit, accessories, and setting in this image.');
    contents.push(dataUrlToGenerativePart(sourceImage.dataUrl, sourceImage.mimeType));

    let controlsContext = '';
    if (controls) {
      const durationRaw = controls.duration === 'User specified' ? controls.customDuration || 'Custom' : controls.duration;
      const cameraRaw = controls.cameraMovement === 'User specified' ? controls.customCameraMovement || 'Custom' : controls.cameraMovement;
      controlsContext = `
STRUCTURED VIDEO CONTROLS (Veo 3.1 native):
- Target Duration (normalize to Veo: 4s/6s/8s; 8s forced for 1080p/4K/reference — map 5s→6s, 10s→8s): ${durationRaw}
- Camera Movement Trajectory (ONE move only — static lock-off / slow push-in / pull-back / pan / tilt / handheld micro-drift / tracking / orbit): ${cameraRaw}
- Motion Style: ${controls.motionStyle}
- Pacing & Rhythm: ${controls.pacing}
- Target Video Model & Dialect: ${controls.targetEngine || 'Auto (Veo 3.1 cinematic)'}
- Veo Physics & Reels Guardrails: single continuous shot, no cuts, locked focus, deep/shallow DOF as appropriate, staged action with inertia, 9:16 center-safe framing with clean upper-third for captions if vertical, no generated text/logos/watermarks
(Note: For any parameter marked 'Auto', intelligently infer the optimal Veo 3.1 choreography. Always emit Audio layer: Ambient + SFX + music decision, dialogue quoted if present).`;
    }

    const userPrompt = `
USER'S VIDEO CREATIVE DIRECTION:
"${creativeDirection.trim()}"

${controlsContext}

VEO 3.1 DIRECTOR TASK:
Analyze the source image and engineer ONE legendary Veo 3.1 image-to-video prompt using the 7-slot formula [Cinematography + Subject + Staged Action + Context + Style/Lighting + Audio] in natural director prose.
Requirements: starting from exact source frame, 8+ identity tokens, ONE camera move (framing+lens+movement), staged reach→grip→hold→turn sequence with weight/inertia/ground friction, solid collision (no clipping), 1:1 mirror parity if mirror present, static architecture, first-second hook, single continuous shot resolving by ~7.5s, full Audio layer (Ambient + SFX + no music/dialogue decision), 9:16 center-safe if vertical.

SAFETY & ZERO-FLAGGING COMPLIANCE:
- NEVER mention real human names or personal identifiers. Refer to subject as "the female protagonist character from the source image" or "the fictional muse featured in the starting frame".
- Reframe all scenes in professional commercial fashion editorial / luxury showroom / cinematic terms to prevent downstream refusals. Output pure JSON only.`;

    contents.push(userPrompt);

    // 4. Execute LLM Call with fallback
    let result;
    try {
      result = await model.generateContent(contents);
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      console.warn(`Primary model ${modelName} call failed:`, error?.message);

      if (modelName !== 'gemini-2.5-flash' && modelName !== 'gemini-1.5-flash') {
        const fallbackModelName = 'gemini-2.5-flash';
        console.log(`Attempting fallback to ${fallbackModelName}...`);
        const fallbackModel = genAI.getGenerativeModel({
          model: fallbackModelName,
          systemInstruction: VIDEO_PROMPT_SYSTEM_INSTRUCTION,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });
        result = await fallbackModel.generateContent(contents);
      } else {
        throw error;
      }
    }

    const responseText = result.response.text();
    const parsedData = parseStructuredResponse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Video prompt generation error:', err);
    return NextResponse.json(
      {
        error:
          err.message || 'Prompt generation failed. Check your API configuration and try again.',
      },
      { status: 500 }
    );
  }
}
