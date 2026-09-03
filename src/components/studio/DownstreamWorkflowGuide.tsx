'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Copy, CheckCheck } from 'lucide-react';

interface DownstreamWorkflowGuideProps {
  masterPrompt: string;
  negativePrompt?: string;
  targetEngine?: string;
}

interface Step {
  label: string;
  description: string;
  copyText?: string;
  link?: string;
  linkLabel?: string;
  badge?: string;
  badgeColor?: string;
}

interface EngineGuide {
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  icon: string;
  link: string;
  steps: Step[];
}

export const DownstreamWorkflowGuide: React.FC<DownstreamWorkflowGuideProps> = ({
  masterPrompt,
  negativePrompt,
  targetEngine,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isViggle = targetEngine?.includes('Viggle');

  const guides: EngineGuide[] = [
    {
      name: 'Viggle AI Mix',
      tagline: 'Fastest · Exact motion replication onto your character',
      badge: '🎬 Free · Best for Motion Swap',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      icon: '🎭',
      link: 'https://viggle.ai',
      steps: [
        {
          label: 'Go to Viggle AI',
          description: 'Open viggle.ai → Sign in free → Click "Mix" mode',
          link: 'https://viggle.ai',
          linkLabel: 'Open Viggle AI →',
        },
        {
          label: 'Upload your AI influencer image',
          description: 'Upload a clear front-facing image of your AI character (PNG/JPG). This is your "target identity".',
        },
        {
          label: 'Upload your reference motion video',
          description: 'Upload the source video whose movement you want to transfer. Viggle extracts the exact skeleton.',
        },
        {
          label: 'Click "Generate"',
          description: 'Viggle maps the skeletal motion from the reference video onto your character — no prompt needed. Free renders available daily.',
        },
        {
          label: 'Optional: Use the Master Prompt in "Animate" mode',
          description: 'For text-to-video style, paste your Master Prompt into Viggle\'s Animate mode.',
          copyText: masterPrompt,
        },
      ],
    },
    {
      name: 'Kling AI',
      tagline: 'Most generous free daily credits · Best character physics',
      badge: '✨ Free Daily Credits · Best Overall',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: '🌟',
      link: 'https://klingai.com',
      steps: [
        {
          label: 'Open Kling AI',
          description: 'Go to klingai.com → Sign up free → Select "Image to Video" or "Text to Video"',
          link: 'https://klingai.com',
          linkLabel: 'Open Kling AI →',
        },
        {
          label: 'Upload your AI influencer image',
          description: 'In "Image to Video" mode — upload your character reference image as the starting frame.',
        },
        {
          label: 'Paste the Master Prompt',
          description: 'Paste your generated Master Prompt in the text field. Kling excels at character physics, cloth momentum, and facial continuity.',
          copyText: masterPrompt,
        },
        negativePrompt ? {
          label: 'Add Negative Prompt',
          description: 'Paste in the Negative Prompt field to block glitches.',
          copyText: negativePrompt,
        } : null,
        {
          label: 'Set duration to 5-10s and click Generate',
          description: 'Free tier gives you daily credits. 5-second clips consume fewer credits. Generate and download.',
        },
      ].filter(Boolean) as Step[],
    },
    {
      name: 'Morph Studio (Veo 3.1)',
      tagline: 'Google Veo 3.1 with reference image support',
      badge: '🎥 Free Credits · Veo 3.1 Powered',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      icon: '🎬',
      link: 'https://morphstudio.com',
      steps: [
        {
          label: 'Open Morph Studio',
          description: 'Go to morphstudio.com → Sign up free → select Veo 3.1 model',
          link: 'https://morphstudio.com',
          linkLabel: 'Open Morph Studio →',
        },
        {
          label: 'Upload reference images (up to 3)',
          description: 'Upload: 1) Your AI influencer image, 2) Optionally: environment reference, 3) Optionally: garment reference. Veo 3.1 uses these as "Ingredients".',
        },
        {
          label: 'Paste the Master Prompt',
          description: 'Copy and paste your generated Master Prompt into the text field. Select 9:16 for Reels or 16:9 for widescreen.',
          copyText: masterPrompt,
        },
        {
          label: 'Generate & Download',
          description: 'Click Generate. Veo 3.1 produces native audio along with video. Free credits available on sign-up.',
        },
      ],
    },
    {
      name: 'Hailuo / MiniMax AI',
      tagline: 'Free cinematic realism · Great for fashion & editorial',
      badge: '🎞️ Free Tier · Cinematic Quality',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: '🎞️',
      link: 'https://hailuoai.video',
      steps: [
        {
          label: 'Open Hailuo AI',
          description: 'Go to hailuoai.video → Sign in free → Choose "Image to Video"',
          link: 'https://hailuoai.video',
          linkLabel: 'Open Hailuo AI →',
        },
        {
          label: 'Upload your AI influencer image',
          description: 'Upload your character reference. Hailuo anchors the identity from the first frame.',
        },
        {
          label: 'Paste the Master Prompt',
          description: 'Paste your Master Prompt. Hailuo responds very well to atmospheric, scene-painting present-tense language.',
          copyText: masterPrompt,
        },
        {
          label: 'Generate',
          description: 'Free daily generations. Excellent for fashion editorial realism and smooth character motion.',
        },
      ],
    },
    {
      name: 'Runway Gen-3/4',
      tagline: 'Free tier · Best for precise camera movement control',
      badge: '🎥 Free Tier · Camera Control King',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      icon: '🚀',
      link: 'https://runwayml.com',
      steps: [
        {
          label: 'Open Runway',
          description: 'Go to runwayml.com → Sign up free → Select Gen-3 or Gen-4 Alpha model → Image to Video',
          link: 'https://runwayml.com',
          linkLabel: 'Open Runway →',
        },
        {
          label: 'Upload influencer image as start frame',
          description: 'Upload your character image. Enable "Style Reference" if available for consistent character rendering.',
        },
        {
          label: 'Paste the Master Prompt',
          description: 'Paste the Master Prompt. Lead with explicit camera movement in Runway — it responds best to "Camera: slow tracking dolly..." phrasing.',
          copyText: masterPrompt,
        },
        {
          label: 'Generate',
          description: 'Free tier gives 125 credits on sign-up. Best for complex camera trajectories and kinetic motion.',
        },
      ],
    },
  ];

  // Prioritize guide based on targetEngine
  const orderedGuides = isViggle
    ? [guides[0], ...guides.slice(1)]
    : guides;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗺️</span>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Free Downstream Workflow Guide</h3>
            <p className="text-xs text-zinc-400">Step-by-step for Viggle · Kling · Morph Studio · Hailuo · Runway</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800/60 p-4 space-y-4">
          {/* Engine tabs */}
          <div className="flex flex-wrap gap-2">
            {orderedGuides.map((g) => (
              <span key={g.name} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${g.badgeColor}`}>
                {g.badge}
              </span>
            ))}
          </div>

          {orderedGuides.map((guide) => (
            <GuideCard key={guide.name} guide={guide} copiedKey={copiedKey} onCopy={copy} />
          ))}
        </div>
      )}
    </div>
  );
};

function GuideCard({
  guide,
  copiedKey,
  onCopy,
}: {
  guide: EngineGuide;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{guide.icon}</span>
          <div>
            <p className="text-sm font-bold text-zinc-100">{guide.name}</p>
            <p className="text-[11px] text-zinc-400">{guide.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={guide.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800/60 p-4 space-y-3">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-zinc-200">{step.label}</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{step.description}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    {step.linkLabel} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {step.copyText && (
                  <button
                    onClick={() => onCopy(step.copyText!, `${guide.name}-${i}`)}
                    className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 font-semibold transition-colors"
                  >
                    {copiedKey === `${guide.name}-${i}` ? (
                      <><CheckCheck className="w-3 h-3 text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy for {guide.name}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
