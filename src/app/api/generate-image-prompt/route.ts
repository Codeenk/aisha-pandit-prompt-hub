import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  getModelIdentifier,
  dataUrlToGenerativePart,
  parseStructuredResponse,
} from '@/lib/gemini/client';
import { IMAGE_PROMPT_SYSTEM_INSTRUCTION } from '@/lib/gemini/system-prompts';
import { ImageControls, ImageReference } from '@/types/prompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      modelReference,
      fashionReference,
      poseReference,
      locationReference,
      creativeDirection,
      controls,
    }: {
      modelReference?: ImageReference;
      fashionReference?: ImageReference;
      poseReference?: ImageReference | null;
      locationReference?: ImageReference;
      creativeDirection?: string;
      controls?: ImageControls;
    } = body;

    // 1. Validation
    if (!modelReference || !modelReference.dataUrl) {
      return NextResponse.json(
        { error: 'Model reference required. Please upload the identity source image.' },
        { status: 400 }
      );
    }

    if (!fashionReference || !fashionReference.dataUrl) {
      return NextResponse.json(
        { error: 'Fashion reference required. Please upload the clothing source image.' },
        { status: 400 }
      );
    }

    if (!creativeDirection || !creativeDirection.trim()) {
      return NextResponse.json(
        { error: 'Tell us what you want to create first. Describe your creative vision.' },
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
      systemInstruction: IMAGE_PROMPT_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    // 3. Assemble Multimodal Parts
    const contents: (string | ReturnType<typeof dataUrlToGenerativePart>)[] = [];

    // Model reference image
    contents.push('--- REFERENCE 1: MODEL IDENTITY REFERENCE (REQUIRED) ---');
    contents.push('Use this image as the strict identity reference for the subject (facial features, facial structure, skin undertones, hair, eye shape).');
    contents.push(dataUrlToGenerativePart(modelReference.dataUrl, modelReference.mimeType));

    // Fashion reference image
    contents.push('--- REFERENCE 2: FASHION / GARMENT REFERENCE (REQUIRED) ---');
    contents.push('Use this image as the exact clothing blueprint (garment type, silhouette, fabric texture, cut, drapery, color, styling). Fit this outfit naturally onto the model.');
    contents.push(dataUrlToGenerativePart(fashionReference.dataUrl, fashionReference.mimeType));

    // Pose reference image (Optional — skeleton only)
    if (poseReference && poseReference.dataUrl) {
      contents.push('--- REFERENCE 3: POSE / BODY LANGUAGE REFERENCE (PROVIDED — SKELETON ONLY) ---');
      contents.push('Extract ONLY the skeletal pose structure: joint angles, limb positions, torso torsion, hand placement, foot grounding and weight distribution, spine curvature, gaze vector. IGNORE all identity, facial features, hair, garment, accessories, background and lighting from this image. Do NOT transfer face or clothes from this pose image. Map the Model identity + Fashion garment onto this pose with anatomical rigidity.');
      contents.push(dataUrlToGenerativePart(poseReference.dataUrl, poseReference.mimeType));
    } else {
      contents.push('--- REFERENCE 3: POSE / BODY LANGUAGE REFERENCE ---');
      contents.push('NOTE: No pose reference was provided. Infer the optimal body language and pose exclusively from the user\'s creative direction and cinematography controls. No pose blueprint to follow.');
    }

    // Location reference image (Optional)
    if (locationReference && locationReference.dataUrl) {
      contents.push('--- REFERENCE 4: LOCATION / ENVIRONMENT REFERENCE (PROVIDED) ---');
      contents.push('Analyze the architecture, environmental depth, lighting ambiance, vegetation, and spatial composition from this image to anchor the background scene.');
      contents.push(dataUrlToGenerativePart(locationReference.dataUrl, locationReference.mimeType));
    } else {
      contents.push('--- REFERENCE 4: LOCATION / ENVIRONMENT REFERENCE ---');
      contents.push('NOTE: No location reference was provided. Infer the environment exclusively from the user\'s creative description.');
    }

    // User Creative Direction & Controls
    let controlsContext = '';
    if (controls) {
      controlsContext = `
STRUCTURED CREATIVE CONTROLS (Instagram + Veo-ingredient ready):
- Composition Framing: ${controls.composition === 'User specified' ? controls.customComposition || 'Custom' : controls.composition}
- Camera Type (specify lens triad: framing + lens + focus): ${controls.camera === 'User specified' ? controls.customCamera || 'Custom' : controls.camera}
- Lighting Setup (source + direction + temperature): ${controls.lighting === 'User specified' ? controls.customLighting || 'Custom' : controls.lighting}
- Target Aspect Ratio (9:16 vertical = center-safe middle 60%, clean upper third for captions): ${controls.aspectRatio}
- Visual Style / Mood: ${controls.visualStyle}
- Influencer Guardrails: 8K RAW, micro-pores + subsurface scattering + peach fuzz, 5-finger anatomy, gravity drape, contact shadow, noun-only negative fence
(Note: For Auto, infer optimal photographic choice. Keep prompt 80-150 words, dense and visual).`;
    }

    const userPrompt = `
USER'S CREATIVE DIRECTION:
"${creativeDirection.trim()}"

${controlsContext}

TASK:
Analyze the provided reference images and creative direction. Engineer ONE highly cohesive, photorealistic downstream image prompt adhering to all instructions.

SAFETY & ZERO-FLAGGING COMPLIANCE:
- NEVER mention real human names or personal identifiers in the prompt. Refer to the subject as "the female character in the model reference" or "the model featured in the reference frame".
- Reframe all scenes and wardrobe descriptions in professional high-fashion editorial, luxury campaign, or cinematic contexts to prevent downstream AI policy rejections. Output pure JSON.`;

    contents.push(userPrompt);

    // 4. Execute LLM Call with fallback attempt for model variants
    let result;
    try {
      result = await model.generateContent(contents);
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      console.warn(`Primary model ${modelName} call failed:`, error?.message);

      // Graceful fallback to gemini-2.5-flash / gemini-1.5-flash if gemma-4 or specific model is unavailable in the environment
      if (modelName !== 'gemini-2.5-flash' && modelName !== 'gemini-1.5-flash') {
        const fallbackModelName = 'gemini-2.5-flash';
        console.log(`Attempting fallback to ${fallbackModelName}...`);
        const fallbackModel = genAI.getGenerativeModel({
          model: fallbackModelName,
          systemInstruction: IMAGE_PROMPT_SYSTEM_INSTRUCTION,
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
    console.error('Image prompt generation error:', err);
    return NextResponse.json(
      {
        error:
          err.message || 'Prompt generation failed. Check your API configuration and try again.',
      },
      { status: 500 }
    );
  }
}
