# AI Guide And Route Planning

## Purpose

Record the Codex prompts used to add the AI guide, Qwen responses, AMap routes, and persisted chat history.

## Primary Prompt Summary

```text
Help me add an AI guide to this Vue 3 heritage app. It should answer Suzhou culture questions based on the current page, including Pingjiang Road, gardens, museums, and living heritage. If the user asks in Chinese, English, Japanese, or Korean, the guide should reply in the same language where possible. Use `/api/chat` as the backend endpoint, connect it to Qwen, and never hardcode API keys. Read all keys from `.env.local` or Vercel environment variables. Logged-in users should have their conversations saved in Supabase so history is still available after refreshing.

Please also explain the data flow: what the frontend sends, what the API returns, and what Supabase stores. Add tests for language detection, conversation history, and error messages.
```

## Follow-Up Prompt Summary

```text
Continue improving the AI guide so it can plan routes. Users may ask things like "How do I get from my current location to Humble Administrator's Garden?", "Where should I start?", or "Plan a Suzhou route for me." Distinguish normal Q&A, itinerary suggestions, and real navigation requests. For navigation, use AMap Web Service and return walking, driving, and public transit information. Only allow destinations within Suzhou. The map dialog should receive a structured `routePlan`.

Add tests for route-request detection, direct landmark-name prompts, route distance and duration formatting, and rejection of places outside Suzhou.
```

## Assisted Components

- `api/chat.js`
- `src/shared/lbsRouteAgent.js`
- `src/shared/chatLanguage.js`
- `src/data/poiMapData.js`
- `src/components/maps/ScenicMapDialog.vue`
- `src/components/maps/scenicMapDialogI18n.js`

## Human Review And Verification

- Checked that API keys are read from environment variables instead of being hardcoded.
- Verified route requests stay inside Suzhou.
- Added and ran Node tests for language detection, route intent parsing, and route summary formatting.
- Confirmed errors are returned as user-facing messages instead of leaking raw provider details where possible.
