import { describe, it, expect } from 'vitest';
import {
  MOTION_ANALYSIS_SYSTEM_INSTRUCTION,
  MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION,
} from '../src/lib/gemini/system-prompts';
import { parseStructuredResponse } from '../src/lib/gemini/client';

describe('Motion Transfer & Veo 3.1 Prompt System', () => {
  it('should define MOTION_ANALYSIS_SYSTEM_INSTRUCTION with biomechanics rules', () => {
    expect(MOTION_ANALYSIS_SYSTEM_INSTRUCTION).toBeDefined();
    expect(MOTION_ANALYSIS_SYSTEM_INSTRUCTION).toContain('Biomechanics Analyst');
    expect(MOTION_ANALYSIS_SYSTEM_INSTRUCTION).toContain('motionDescriptor');
    // Ensure it strictly ignores original clothes and background
    expect(MOTION_ANALYSIS_SYSTEM_INSTRUCTION).toContain('DO NOT describe the original subject\'s face, clothing');
  });

  it('should define MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION with 5-part Veo 3.1 formula', () => {
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toBeDefined();
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('MASTER FORMULA:');
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('[INFLUENCER IDENTITY]');
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('[CUSTOM WARDROBE]');
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('[SKELETAL MOTION]');
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('[CUSTOM ENVIRONMENT]');
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('[CINEMATOGRAPHY]');
    // Check safety rule: never use real names
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('Never use real names');
    // Check bracket timestamp prevention
    expect(MOTION_MASTER_PROMPT_SYSTEM_INSTRUCTION).toContain('NEVER use bracket timestamps');
  });

  it('should parse motion transfer response JSON with physics anchors', () => {
    const raw = JSON.stringify({
      prompt: 'The AI fashion model from the starting reference wearing a maroon lace dress pivots smoothly on her right heel...',
      negative_prompt: 'morphing, warped limbs, extra fingers, sliding feet, split pupils',
      physics_and_realism_anchors: [
        'Rigid skull & facial bone geometry during full-body rotation',
        '5-finger anatomical non-collision with prop boundaries',
      ],
      quality_score: 98,
      analysis: {
        identity: true,
        garment: true,
        motion: true,
        photorealism: true,
        summary: '5-part Veo 3.1 Master Prompt',
      },
      tags: ['Motion Transfer', 'Veo 3.1 Master Prompt', 'Skeletal Choreography'],
    });

    const parsed = parseStructuredResponse(raw);
    expect(parsed.prompt).toContain('The AI fashion model');
    expect(parsed.quality_score).toBe(98);
    expect(parsed.physics_and_realism_anchors?.length).toBe(2);
    expect(parsed.tags).toContain('Motion Transfer');
  });
});
