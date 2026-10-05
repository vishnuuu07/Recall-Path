# Recall Path

Users can remember a photo richly but may lack a discriminative retrieval anchor. Recall Path explores **candidate-aware adaptive retrieval**: the system proposes useful distinctions from the current candidate ambiguity, rather than asking users to invent a better query or exposing a static filter panel.

Search → broad candidates → adaptive constraints → include/exclude → rerank → target.

This is a mobile-first React + Vite JavaScript app with plain CSS, Lucide icons, a controlled 45-asset local corpus, and a local heuristic engine. It includes Photos, Search, Results, three-state refinement capsules, candidate feedback sheets, and a memory-found state with session metrics. Recent searches persist in localStorage. No backend, authentication, AI API, or API keys are needed. All runtime images are bundled in `public/photos`; no image service is contacted by the app.

## Run locally

```sh
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## Demo searches

- **Sky:** include Mountains to bring mountain scenes to the top; tap the selected capsule and choose Exclude or Clear.
- **girl:** include Young, then Outdoor. Include Traditional, tap it again, and choose Exclude. Traditional imagery falls out of the results. Clear all resets the search.
- **Aadhaar card:** generic, clearly fictional ID and document illustrations; no real identity information.
- **wedding:** distinguish Bride, Group photo, Evening, and Traditional wear.
- **baby throwing something in the dustbin:** starts in a broad baby/child neighborhood. Include Toddler, Indoors, then Video to bring the target-like clip to the top.
- **my little brother throwing something in the dustbin:** the alternate episodic recall scenario.
- **Dslr**, **Drawing**, people names, and arbitrary custom queries also work.

Tap a result → **This is close** → **Same event** (or another shared context) to rerank using candidate metadata. Tap a result → **This is it** to finish. Selected capsules open Include / Exclude / Clear menus. The profile avatar contains the explanation and concept disclaimer.

## Build and verify

```sh
npm test
npm run build
npm run preview
```

`npm run build` produces `dist`. Tests verify corpus completeness, scene separation, positive and negative evidence, adaptive suggestions, target promotion, context feedback, and custom-query fallback.

## Deploy to Vercel

1. Push this folder to a Git repository and import it in Vercel.
2. Select the **Vite** framework preset.
3. Set install command to `npm install`, build command to `npm run build`, and output directory to `dist`.
4. Deploy. No environment variables or routing rewrites are required.

Alternatively, run `npx vercel` from this folder and follow the prompts. A minimal `vercel.json` supplies the build settings.

## Prototype scope

The AI behavior is simulated using weighted metadata matching, candidate separation heuristics, curated initial suggestions, and contextual boosts. Dates, locations, people labels, and events are fictional illustrative metadata. Video tiles use still posters and simulated durations; playback is intentionally mocked. Backup, voice search, notifications, Collections, and Create use lightweight informational responses. Metrics stay in memory; there is no remote analytics collection.

Photography is bundled from Unsplash; source image identifiers are listed in `src/data/photos.js` and `scripts/asset-manifest.json`. The toddler-and-bin poster is AI-generated using the built-in image generation tool. Fictional documents are local SVG illustrations. `scripts/download-assets.py` is an optional authoring utility, not part of install, build, or runtime.

Independent concept prototype. Not affiliated with Google.
