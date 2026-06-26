# MEMORY.md

## Project Facts

- 2026-06-18: Project name inferred as `laya.com`.
- 2026-06-18: Repository appears to be a static HTML/CSS/JavaScript site with `index.html`, `index-v2.html`, `assets/`, `css/`, `js/`, `media/`, and `scripts/`.

## Decisions

- 2026-06-26: `index-v2.html` added a standalone `实习经历` section sourced from `伍可莹简历v2.docx`, presenting 展望数科 全栈工程师实习生 experience as ToB AI demand discovery, client research, 知语 AI platform development, 旌灵云仓小程序 delivery, and AI-assisted development.
- 2026-06-26: GitHub search found strong resume-skill candidates: `couragec/LLMInternSkill` is the best fit for LLM/AI internship resume diagnosis, JD tailoring, evidence boundaries, interview grilling, and upgrade plans; `cosen1024/resume-builder-skill` is best for resume PDF/HTML generation and templates; `Paramchoudhary/ResumeSkills` has many generic career/resume skills but is less Codex-specific.
- 2026-06-26: Official OpenAI curated skills list has no dedicated resume/career/job-application skill. For intern resume editing, best path is a custom local skill focused on resume diagnosis, internship positioning, quantified project bullets, ATS keywords, and Chinese/English versions; install `pdf` only if resume parsing/export from PDF is needed.
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
- 2026-06-18: Improved `Pixel Laya` motion by adding layered idle timing, mouse-follow body/eye tracking, small thought pixels, sharper wave/hop feedback, and hover-triggered looking/coding states.
- 2026-06-18: Slimmed `Pixel Laya` by narrowing the head/hair/body/laptop, lengthening the body/legs, reducing the shadow width, and removing the oversized scale so the companion reads lighter.
- 2026-06-18: Rebuilt `Pixel Laya` from unclear CSS span/box-shadow blocks into an inline SVG pixel character with explicit black-outlined face, hair, body, arms, legs, and laptop for clearer silhouette.
- 2026-06-18: User chose DeepSeek over OpenAI for AI daily generation. DeepSeek is used only for summarization; the serverless function gathers real sources from feeds first because DeepSeek does not provide the OpenAI web search tool.
- 2026-06-18: User wants more information in the AI daily. Backend should collect more feed items and output 8-12 stories; PDF should support continuation pages instead of compressing everything onto one page.
- 2026-06-25: User decided to keep RSS/public sources plus DeepSeek instead of paying for X API. Expand sources with arXiv, Reddit AI communities, and major AI company blogs before considering X.


- 2026-06-26: `知语 AI` Case File screenshots were copied from WeChat temp paths into `assets/zwskchat/` as `chat-rag.png`, `assistant-gallery.png`, `knowledge-base.png`, and `workbench.png`; `index-v2.html` should reference these project-local assets.

## External Resources

- 2026-06-26: Installed `llm-intern-skill` from `couragec/LLMInternSkill` to `C:\Users\LAYA\.codex\skills\llm-intern-skill`; restart Codex to make the new skill available in future sessions.
- Codex hatch-pet skill: `C:\Users\LAYA\.codex\skills\hatch-pet\SKILL.md`
- 2026-06-18: Website image assets for external builders were copied into `website-assets-package/`, with English filenames and a README mapping images to projects.
- 2026-06-18: Relevant references for future AI daily report work: OpenAI Responses API web search docs, OpenAI Codex Agent Skills docs, and RSSHub for generating RSS feeds from sites without native RSS.

## Open Questions

- Deployment target is Vercel for the AI daily serverless rollout.
- Test workflow is not documented.
