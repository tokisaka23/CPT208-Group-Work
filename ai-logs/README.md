# AI Coding Assistance Logs

This folder records the main Codex-style prompts used while building SuCIty Roam.

## Disclosure Scope

These are not full exported chat transcripts. They are reconstructed primary prompt summaries based on the actual kinds of tasks asked during development: converting audio, reducing image resolution, studying another panorama website, implementing Supabase features, fixing mobile layout, and preparing submission documentation.

They are written this way for the CPT208 "Vibe Coding Logs" requirement:

> If AI was used for coding, include a folder named `/ai-logs` containing the primary prompts used to generate core components.

## Safety Notes

- Real API keys, service role keys, Supabase project secrets, and private credentials are not included.
- Demo credentials are coursework-only and are documented in `README.md` plus the database seed script.
- AI outputs were reviewed, edited, tested, and integrated by the team.

## Log Index

| File | Prompt theme |
| --- | --- |
| `01-ai-guide-and-route-planning.md` | AI guide, Qwen, AMap route planning, chat history |
| `02-auth-friends-location-groups.md` | Supabase Auth, friends, location sharing, group chat |
| `03-community-uploads-and-favorites.md` | UGC uploads, image downscaling, WebP/JPG assets, audio conversion |
| `04-immersive-garden-and-panorama.md` | 720yun analysis, panorama roaming, Three.js viewer behavior |
| `05-localization-accessibility-mobile.md` | Multilingual UI, mobile layout, accessibility polish |
| `06-database-schema-and-demo-data.md` | SQL setup, demo users, README/submission evidence |

## Verification Summary

AI-assisted changes were checked with:

- `npm test`
- `npm run build`
- Manual review of generated SQL, README instructions, and environment variable handling
- Browser/mobile inspection during panorama, image, audio, and route-flow development
- Security review of auth boundaries, RLS policies, secrets handling, and user-input validation
