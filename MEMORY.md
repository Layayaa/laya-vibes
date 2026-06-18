# MEMORY.md

## Project Facts

- 2026-06-18: Project name inferred as `laya.com`.
- 2026-06-18: Repository appears to be a static HTML/CSS/JavaScript site with `index.html`, `index-v2.html`, `assets/`, `css/`, `js/`, `media/`, and `scripts/`.

## Decisions

- 2026-06-18: Created project-local `AGENTS.md` and `MEMORY.md` because both were missing and the template directory `C:\Users\LAYA\.codex\templates` was not present.
- 2026-06-18: For an "AI era daily report" site component, no existing local skill was found. Best direction is a static front-end widget backed by a serverless/API endpoint or automation that gathers sources, summarizes them, and returns cited cards.
- 2026-06-18: Added `AI Daily Press` as a newspaper-style front-end section. It calls `/api/ai-daily` on click and falls back to local preview data when the serverless endpoint is unavailable.
- 2026-06-18: User clarified the target page is `index-v2.html` and the visible AI daily component should only be a button that downloads today's report as a PDF, not an expanded on-page newspaper section.
- 2026-06-18: AI daily PDF entry on `index-v2.html` should be a compact homepage chip/button, not a separate full-height section.
- 2026-06-18: User wants the downloaded AI daily PDF styled like a Republic-era Chinese newspaper, with period masthead, narrow columns, double rules, and aged paper texture.
- 2026-06-18: Real AI daily source integration uses Vercel serverless. Root `/` serves `index-v2.html`, and `/api/ai-daily` now uses public RSS/JSON source collection plus DeepSeek chat completions for summarization.
- 2026-06-18: Added `.gitignore` to keep `.env`, local Vercel state, `node_modules`, and logs out of commits while deploying the AI daily API.
- 2026-06-18: User prefers `index-v2.html` visible copy to be Chinese except for necessary product, code, URL, repository, and technology names.
- 2026-06-18: Replaced the `index-v2.html` portrait/avatar card with an original CSS animated pixel companion named `Pixel Laya`, inspired by cozy pixel RPG character energy but not copied from Stardew Valley assets.
- 2026-06-18: User chose DeepSeek over OpenAI for AI daily generation. DeepSeek is used only for summarization; the serverless function gathers real sources from feeds first because DeepSeek does not provide the OpenAI web search tool.

## External Resources

- Codex hatch-pet skill: `C:\Users\LAYA\.codex\skills\hatch-pet\SKILL.md`
- 2026-06-18: Website image assets for external builders were copied into `website-assets-package/`, with English filenames and a README mapping images to projects.
- 2026-06-18: Relevant references for future AI daily report work: OpenAI Responses API web search docs, OpenAI Codex Agent Skills docs, and RSSHub for generating RSS feeds from sites without native RSS.

## Open Questions

- Deployment target is Vercel for the AI daily serverless rollout.
- Test workflow is not documented.
