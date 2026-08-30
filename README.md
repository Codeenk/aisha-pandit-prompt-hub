# Aisha Pandit Prompt Hub

> **Turn creative intent into production-ready image & video prompts.**

Aisha Pandit Prompt Hub is a professional AI visual prompt engineering laboratory built with Next.js, TypeScript, Tailwind CSS, and the Google Gemini Multimodal API.

It takes vague natural-language creative ideas and multimodal reference images (model identity, fashion garments, environments, and video source frames) and converts them into production-ready prompts for downstream generation models like **ChatGPT Images**, **Gemini Imagen**, and **Gemini Veo**.

---

## Key Capabilities

- **Image Prompt Mode**:
  - **Model Reference** (Required): Identity anchor preserving facial structure, gaze, skin tone, and hair without identity drift.
  - **Fashion Reference** (Required): Garment blueprint accurately transferring clothing silhouette, fabric texture, cut, and color palette.
  - **Location Reference** (Optional): Scenery/architecture reference. If omitted, the system explicitly infers the environment exclusively from the user's creative brief.
  - **Advanced Image Controls**: Composition, Camera type, Lighting setups, Aspect ratios (1:1, 4:5, 3:4, 9:16, 16:9), and Visual styles (Photorealistic, Fashion Editorial, Luxury Campaign, etc.).
- **Video Prompt Mode**:
  - **Source Image** (Required): Single source-of-truth anchor frame for image-to-video synthesis.
  - **Temporal Motion Reasoning**: Converts vague human requests into chronological micro-choreography (Initial State &rarr; Action &rarr; Camera Trajectory &rarr; Micro-expressions &rarr; Ending Frame).
  - **Advanced Video Controls**: Duration, Camera movement, Motion style, and Pacing.
- **Prompt Laboratory Refinements**:
  - **Single-Click Copy**: Prominent copy button with feedback.
  - **Regenerate**: Produces fresh alternative interpretations.
  - **Improve**: Sharpens texture details, lighting physics, and prompt fidelity.
  - **Shorten**: Condenses token footprint for compact prompt slots.
  - **Expand**: Elaborates on atmospheric depth and cinematography.
  - **Prompt Quality Score**: Real-time completeness and quality score (e.g. `94 / 100`).
- **Prompt History**: Locally persisted history with filtering, search, and 1-click loading.
- **Privacy & Security**: Server-side API key handling; custom API key configuration via browser storage settings without exposing keys in client bundle.

---

## Getting Started

### 1. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Google AI Studio / Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemma-4-26b-a4b-it
```

*Recommended Models:*
- `gemma-4-26b-a4b-it` (Gemma 4 Mixture-of-Experts Multimodal Model)
- `gemini-2.5-flash`
- `gemini-2.0-flash`
- `gemini-1.5-flash`
- `gemini-1.5-pro`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Tests & Production Build

```bash
npm test
npm run build
```
