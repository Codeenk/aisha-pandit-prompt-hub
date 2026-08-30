import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  getModelIdentifier,
  parseStructuredResponse,
} from '@/lib/gemini/client';
import { MODIFY_PROMPT_SYSTEM_INSTRUCTION } from '@/lib/gemini/system-prompts';
import { ModifyAction, StudioMode } from '@/types/prompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentPrompt,
      mode,
      action,
      creativeDirection,
    }: {
      currentPrompt: string;
      mode: StudioMode;
      action: ModifyAction;
      creativeDirection?: string;
    } = body;

    if (!currentPrompt || !currentPrompt.trim()) {
      return NextResponse.json(
        { error: 'No prompt provided to modify.' },
        { status: 400 }
      );
    }

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
      systemInstruction: MODIFY_PROMPT_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: action === 'regenerate' ? 0.8 : 0.4,
      },
    });

    let actionDirective = '';
    switch (action) {
      case 'regenerate':
        actionDirective = `REGENERATE: Produce a materially improved, distinct creative alternative for this ${mode} prompt while honoring the original intent. Change the camera angle, framing, or dynamic mood for fresh variety.`;
        break;
      case 'improve':
        actionDirective = `IMPROVE: Elevate prompt fidelity, sharpen tactile textures, refine lighting physics, and strengthen consistency constraints.`;
        break;
      case 'shorten':
        actionDirective = `SHORTEN: Condense the prompt into a concise, high-impact version preserving all essential visual markers while eliminating fluff.`;
        break;
      case 'expand':
        actionDirective = `EXPAND: Elaborate on atmospheric depth, micro-details, sensory textures, and cinematic background interplay without adding meaningless buzzwords.`;
        break;
    }

    const userPrompt = `
CURRENT PROMPT:
"${currentPrompt}"

ORIGINAL CREATIVE DIRECTION:
"${creativeDirection || 'N/A'}"

MODE: ${mode.toUpperCase()} PROMPT

MODIFICATION DIRECTIVE:
${actionDirective}

Respond with pure JSON containing the modified prompt.`;

    let result;
    try {
      result = await model.generateContent(userPrompt);
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      if (modelName !== 'gemini-2.5-flash' && modelName !== 'gemini-1.5-flash') {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: MODIFY_PROMPT_SYSTEM_INSTRUCTION,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });
        result = await fallbackModel.generateContent(userPrompt);
      } else {
        throw error;
      }
    }

    const responseText = result.response.text();
    const parsedData = parseStructuredResponse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Prompt modification error:', err);
    return NextResponse.json(
      {
        error:
          err.message || 'Prompt modification failed. Check your API configuration and try again.',
      },
      { status: 500 }
    );
  }
}
