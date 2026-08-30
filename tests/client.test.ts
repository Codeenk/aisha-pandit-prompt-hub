import { describe, it, expect } from 'vitest';
import {
  parseStructuredResponse,
  dataUrlToGenerativePart,
  getModelIdentifier,
} from '../src/lib/gemini/client';

describe('Gemini Client & Parser Utilities', () => {
  it('should correctly parse pure JSON responses', () => {
    const raw = JSON.stringify({
      prompt: 'Photorealistic editorial shot of Aisha in emerald gown...',
      quality_score: 95,
      analysis: {
        identity: true,
        garment: true,
        environment: true,
        composition: true,
        lighting: true,
        summary: 'High fidelity fashion prompt',
      },
      tags: ['85mm', 'Editorial', 'Golden Hour'],
    });

    const parsed = parseStructuredResponse(raw);
    expect(parsed.prompt).toContain('Photorealistic editorial shot');
    expect(parsed.quality_score).toBe(95);
    expect(parsed.analysis.identity).toBe(true);
    expect(parsed.tags).toContain('85mm');
  });

  it('should parse JSON wrapped in markdown codeblocks', () => {
    const raw = `Here is the engineered prompt:
\`\`\`json
{
  "prompt": "Cinematic portrait of Aisha...",
  "quality_score": 92,
  "analysis": {
    "summary": "Optimized for natural daylight"
  }
}
\`\`\``;

    const parsed = parseStructuredResponse(raw);
    expect(parsed.prompt).toBe('Cinematic portrait of Aisha...');
    expect(parsed.quality_score).toBe(92);
  });

  it('should fallback gracefully when response is unstructured text', () => {
    const raw = 'Create an ultra-detailed image of Aisha in Paris with natural sun.';
    const parsed = parseStructuredResponse(raw);
    expect(parsed.prompt).toBe('Create an ultra-detailed image of Aisha in Paris with natural sun.');
    expect(parsed.quality_score).toBeGreaterThanOrEqual(80);
  });

  it('should convert data URLs to generative Part format', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const part = dataUrlToGenerativePart(dataUrl);
    expect(part.inlineData).toBeDefined();
    expect(part.inlineData?.mimeType).toBe('image/png');
    expect(part.inlineData?.data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });

  it('should cleanly extract JSON when response contains reasoning bullets and scratchpad preamble', () => {
    const rawMessy = `A woman in a maroon lace dress taking a mirror selfie in a bedroom/dressing area.
360-degree joyous "fit check" in a mirror selfie style. Show the back of the dress slightly casually. Holding the phone in the same hand. Cute/Instagram reel vibe.
10 seconds.

        *   *Subject:* Female character from the source image.
        *   *Outfit:* Maroon lace long-sleeve dress.
        *   *Setting:* Warmly lit, wooden-accented room.
        *   *Prompt:* "A high-fashion lifestyle lookbook video following the character in the source frame as she performs a joyful 360-degree outfit showcase..."

    *   \`tags\`: ["360-Degree Turn", "Mirror Selfie Physics"]{
  "prompt": "A high-fashion lifestyle lookbook video following the character in the source frame as she performs a joyful 360-degree outfit showcase in a large ornate gold mirror.",
  "negative_prompt": "morphing, warped limbs, sliding feet",
  "physics_and_realism_anchors": [
    "Centrifugal fabric sway and lace texture continuity"
  ],
  "quality_score": 98,
  "analysis": {
    "identity": true,
    "garment": true,
    "summary": "Optimized for a seamless 360-degree rotation."
  },
  "tags": ["360-Degree Turn", "Mirror Selfie Physics"]
}`;

    const parsed = parseStructuredResponse(rawMessy);
    expect(parsed.prompt).toBe(
      'A high-fashion lifestyle lookbook video following the character in the source frame as she performs a joyful 360-degree outfit showcase in a large ornate gold mirror.'
    );
    expect(parsed.negative_prompt).toBe('morphing, warped limbs, sliding feet');
    expect(parsed.quality_score).toBe(98);
    expect(parsed.physics_and_realism_anchors).toContain(
      'Centrifugal fabric sway and lace texture continuity'
    );
  });
});
