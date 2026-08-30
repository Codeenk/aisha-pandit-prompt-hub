import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getModelIdentifier } from '@/lib/gemini/client';

export async function GET(req: NextRequest) {
  const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
  const customModel = req.headers.get('x-gemini-model') || undefined;

  const hasEnvKey = !!(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
    process.env.GEMINI_API_KEY.trim().length > 0
  );

  const activeModel = getModelIdentifier(customModel);
  const isConfigured = !!(customApiKey || hasEnvKey);

  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    hasServerKey: hasEnvKey,
    hasCustomKey: !!customApiKey,
    model: activeModel,
    serverTime: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  // Test connection endpoint
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const customModel = req.headers.get('x-gemini-model') || undefined;

    const genAI = getGeminiClient(customApiKey);
    const modelName = getModelIdentifier(customModel);
    const model = genAI.getGenerativeModel({ model: modelName });

    const testResult = await model.generateContent('Respond with "OK" if connected.');
    const response = testResult.response.text();

    return NextResponse.json({
      success: true,
      model: modelName,
      response: response.trim(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'API connection test failed.',
      },
      { status: 400 }
    );
  }
}
