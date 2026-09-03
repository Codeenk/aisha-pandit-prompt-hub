import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getModelIdentifier, parseStructuredResponse } from '@/lib/gemini/client';
import { MOTION_ANALYSIS_SYSTEM_INSTRUCTION } from '@/lib/gemini/system-prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const customModel = req.headers.get('x-gemini-model') || undefined;

    const client = getGeminiClient(customApiKey);
    // Video analysis requires a Gemini model (not Gemma) — force gemini-2.5-flash for this route
    const baseModel = getModelIdentifier(customModel);
    // If user has gemma model set, fall back to gemini-2.5-flash for video analysis
    const modelId = baseModel.toLowerCase().includes('gemma') ? 'gemini-2.5-flash' : baseModel;
    const model = client.getGenerativeModel({
      model: modelId,
      systemInstruction: MOTION_ANALYSIS_SYSTEM_INSTRUCTION,
    });

    const body = await req.json();
    const { videoDataUrl, videoMimeType, targetEngine } = body as {
      videoDataUrl: string;
      videoMimeType: string;
      targetEngine?: string;
    };

    if (!videoDataUrl) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 });
    }

    // Strip data URL prefix to get raw base64
    const base64Data = videoDataUrl.replace(/^data:[^;]+;base64,/, '');

    const contents = [
      {
        inlineData: {
          mimeType: videoMimeType || 'video/mp4',
          data: base64Data,
        },
      },
      `Analyze the human motion in this video. Extract a precise, sequential skeletal motion descriptor for use in an AI video generation prompt.
Target Engine: ${targetEngine || 'Auto (Veo 3.1 / Kling AI / Runway)'}

Focus on:
- Joint movements and angles (shoulders, hips, knees, ankles, wrists, neck)
- Body rotation and weight distribution throughout the motion
- Hand and finger positions and gestures
- Pacing and rhythm (fast, fluid, slow, rhythmic)
- Head and gaze direction transitions
- Foot placement and ground contact behavior

DO NOT describe the original clothing or background. Extract ONLY the biomechanical motion.

Output strictly valid JSON:
{
  "motionDescriptor": "A flowing, sequential paragraph describing the skeletal motion in natural cinematic language ready to be embedded in a video generation prompt.",
  "keyMoments": ["Brief description of moment 1", "Brief description of moment 2", "..."],
  "motionStyle": "One of: fluid, rhythmic, sharp, slow, dynamic, casual, elegant",
  "pacing": "One of: slow, medium, fast, variable",
  "dominantJoints": ["e.g. hips, shoulders, wrists"],
  "quality": 95
}`,
    ];

    let result;
    try {
      result = await model.generateContent(contents);
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      // Fallback to gemini-1.5-flash if primary model fails
      if (error.message?.includes('not found') || error.message?.includes('MODEL_NOT_FOUND')) {
        const fallback = client.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: MOTION_ANALYSIS_SYSTEM_INSTRUCTION,
        });
        result = await fallback.generateContent(contents);
      } else {
        throw error;
      }
    }

    const rawText = result.response.text();
    const parsed = parseStructuredResponse(rawText) as unknown as {
      motionDescriptor: string;
      keyMoments: string[];
      motionStyle: string;
      pacing: string;
      dominantJoints: string[];
      quality: number;
      prompt?: string;
    };

    return NextResponse.json({
      motionDescriptor: parsed.motionDescriptor || parsed.prompt || rawText,
      keyMoments: parsed.keyMoments || [],
      motionStyle: parsed.motionStyle || 'fluid',
      pacing: parsed.pacing || 'medium',
      dominantJoints: parsed.dominantJoints || [],
      quality: parsed.quality || 90,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Motion analysis error:', error);

    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API key not configured. Add your Gemini API key in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Motion analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
