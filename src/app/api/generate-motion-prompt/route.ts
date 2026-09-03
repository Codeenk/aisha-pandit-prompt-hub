import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  getModelIdentifier,
  dataUrlToGenerativePart,
  parseStructuredResponse,
} from '@/lib/gemini/client';
import { MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION } from '@/lib/gemini/system-prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const customModel = req.headers.get('x-gemini-model') || undefined;

    const client = getGeminiClient(customApiKey);
    const modelId = getModelIdentifier(customModel);
    const model = client.getGenerativeModel({
      model: modelId,
      systemInstruction: MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION,
    });

    const body = await req.json();
    const {
      influencerImage,
      wardrobeImage,
      environmentImage,
      motionDescriptor,
      customWardrobe,
      customEnvironment,
      cinematographyStyle,
      targetEngine,
    } = body as {
      influencerImage?: { dataUrl: string; mimeType: string };
      wardrobeImage?: { dataUrl: string; mimeType: string };
      environmentImage?: { dataUrl: string; mimeType: string };
      motionDescriptor: string;
      customWardrobe: string;
      customEnvironment: string;
      cinematographyStyle: string;
      targetEngine?: string;
    };

    if (!motionDescriptor?.trim()) {
      return NextResponse.json({ error: 'Motion descriptor is required.' }, { status: 400 });
    }

    const contents: unknown[] = [];

    if (influencerImage?.dataUrl) {
      contents.push(
        'This is the AI influencer character reference image. Preserve the exact identity, face structure, hair, and body proportions in the generated prompt.'
      );
      contents.push(dataUrlToGenerativePart(influencerImage.dataUrl, influencerImage.mimeType));
    }

    if (wardrobeImage?.dataUrl) {
      contents.push(
        'This is the custom wardrobe / outfit reference image. Extract and preserve the exact garment silhouette, fabrics, textures, color palette, and styling details to clothe the character in.'
      );
      contents.push(dataUrlToGenerativePart(wardrobeImage.dataUrl, wardrobeImage.mimeType));
    }

    if (environmentImage?.dataUrl) {
      contents.push(
        'This is the custom environment / location reference image. Extract and reflect the architectural setting, spatial lighting, textures, materials, and ambient background into the generated prompt.'
      );
      contents.push(dataUrlToGenerativePart(environmentImage.dataUrl, environmentImage.mimeType));
    }

    contents.push(`
BUILD A VEO 3.1 MASTER PROMPT using the 5-Part Master Formula:

[PART 1 — INFLUENCER IDENTITY]
${influencerImage ? 'Derived from the uploaded character reference image above.' : 'A photorealistic AI fashion model with symmetrical features, natural skin texture, and a radiant natural expression.'}

[PART 2 — CUSTOM WARDROBE]
${
  wardrobeImage
    ? 'Derived precisely from the custom fashion / wardrobe reference image provided above' +
      (customWardrobe?.trim() ? `, with additional creative direction: "${customWardrobe.trim()}".` : '.')
    : customWardrobe?.trim() || 'Stylish contemporary high-fashion outfit appropriate to the motion and environment.'
}

[PART 3 — SKELETAL MOTION DESCRIPTOR]
${motionDescriptor.trim()}

[PART 4 — CUSTOM ENVIRONMENT]
${
  environmentImage
    ? 'Derived precisely from the custom environment / location reference image provided above' +
      (customEnvironment?.trim() ? `, with additional atmosphere notes: "${customEnvironment.trim()}".` : '.')
    : customEnvironment?.trim() || 'A minimalist luminous architectural showroom with warm ambient lighting.'
}

[PART 5 — CINEMATOGRAPHY & LIGHTING STYLE]
${cinematographyStyle.trim() || 'Ultra-realistic 4K, anamorphic cinematic lens, smooth tracking camera, natural volumetric lighting.'}

TARGET VIDEO ENGINE: ${targetEngine || 'Auto (Veo 3.1 / Kling AI / Runway)'}

ASSEMBLY INSTRUCTIONS:
- Fuse all 5 parts into ONE cohesive, flowing director-level narrative paragraph ready to paste directly into ${targetEngine || 'Veo 3.1 / Kling AI / Runway'}.
- NEVER use bracket timestamps like [0-2s].
- Write in the cinematographic present tense (active voice).
- Embed anatomical rigidity and anti-uncanny anchors naturally within the prose.
- Refer to the subject as "the protagonist character from the reference" or "the AI fashion model" — never by name.

Output ONLY valid JSON with this exact structure:
{
  "prompt": "The assembled Master Prompt — ready to paste.",
  "negative_prompt": "morphing, warped limbs, extra fingers, mutated hands, sliding feet, split pupils, unblinking stare, melting accessories, distorted background, flickering lights, frozen plastic face, sudden jumps",
  "physics_and_realism_anchors": ["..."],
  "quality_score": 97,
  "analysis": {
    "identity": true,
    "garment": true,
    "environment": true,
    "composition": true,
    "lighting": true,
    "motion": true,
    "photorealism": true,
    "summary": "..."
  },
  "tags": ["Motion Transfer", "Veo 3.1 Master Prompt", "Skeletal Choreography"]
}`);

    let result;
    try {
      result = await model.generateContent(contents as Parameters<typeof model.generateContent>[0]);
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      if (error.message?.includes('not found') || error.message?.includes('MODEL_NOT_FOUND')) {
        const fallback = client.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION,
        });
        result = await fallback.generateContent(
          contents as Parameters<typeof fallback.generateContent>[0]
        );
      } else {
        throw error;
      }
    }

    const rawText = result.response.text();
    const parsed = parseStructuredResponse(rawText);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Motion master prompt error:', error);

    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API key not configured. Add your Gemini API key in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Master prompt generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
