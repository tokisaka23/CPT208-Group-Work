# SuCIty Roam

SuCIty Roam is the CPT208 Human-Centric Computing coursework system for a community heritage resource sharing platform. It is a web-based, mobile-friendly playful heritage guide for Suzhou, combining curated cultural content, immersive garden exploration, AI-assisted route guidance, and social co-visiting features.

The project fits the CPT208 "Playful Experience Design" brief under the Digital Heritage & Play direction. It focuses on helping visitors and local residents explore Suzhou heritage sites in a slower, more social, and more inclusive way.

## Coursework Links

Replace these placeholders before final submission:

| Item | Link |
| --- | --- |
| Live web app | https://cpt-208-group-work.vercel.app/ |
| Source repository | https://github.com/tokisaka23/CPT208-Group-Work |
| Process portfolio | https://sucity-roam.github.io/ |
| Demo video | 通过网盘分享的文件：CPT208_GroupA1-1_SuCity-Roam_DemoVideo.mp4
链接: https://pan.baidu.com/s/1CC3TBf2Yzo3q7ww6crMBMA 提取码: 6657 |

## Core Features

### 1. Heritage Route Hub

- Presents Suzhou heritage content through four main routes: Pingjiang Road, Classical Gardens, Museums, and Living Heritage.
- Includes detailed pages for Humble Administrator's Garden, Lingering Garden, Master of Nets Garden, Tianping Mountain, Pingjiang Road, and Suzhou Museum.
- Supports multilingual interface content in Chinese, English, Japanese, and Korean.

### 2. Immersive Garden Exploration

- Uses Three.js to provide interactive 3D garden scenes with guide mode and free exploration mode.
- Includes panorama-based roaming pages for Humble Administrator's Garden, Lingering Garden, and Master of Nets Garden.
- Provides hotspots, scene notes, visual details, and responsive touch interactions for mobile use.

### 3. AI Guide and Location-Based Routes

- Provides an AI guide panel for cultural explanations, travel suggestions, and page-aware Q&A.
- Uses Qwen API for chat responses when `QWEN_API_KEY` is configured.
- Supports route-intent recognition and AMap-based walking or driving routes for Suzhou points of interest.

### 4. Social Co-Visiting

- Supports Supabase email authentication, user profiles, and password reset with security questions.
- Provides friend codes, friend requests, friend lists, blocking/unblocking, and friend location sharing.
- Includes group chat, group member management, and shared map destination planning.

### 5. Community Uploads and Personal State

- Allows signed-in users to upload heritage photos with title, description, and optional geolocation.
- Stores uploaded images in Supabase Storage and metadata in `ugc_pois`.
- Includes a favorites route for saving personal points of interest.

## Human-Centric Design Alignment

- Equality, diversity, and inclusion: multilingual content and mobile-first layouts make the experience more approachable for different visitor groups.
- Playful interaction: 3D scenes, panoramic roaming, hotspots, AI prompts, shared maps, and social travel features turn heritage browsing into active exploration.
- Ethical and privacy-aware data use: live location sharing is permission-based, account actions require authentication, and secrets are kept in environment variables.
- Accessibility foundations: responsive layout, semantic navigation, user-friendly feedback messages, and image fallbacks are used across the app.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Vant UI |
| 3D and panorama | Three.js, custom panorama viewer, procedural garden scene engine |
| Backend/API | Node.js, Vercel serverless functions, local Node API server |
| Database/Auth | Supabase Auth, Supabase Postgres, Supabase Storage |
| AI and maps | Qwen API, AMap JavaScript SDK, AMap Web Service API |
| Testing | Node.js built-in test runner |
| Deployment | Vercel-compatible SPA and API rewrites |

## Architecture Overview

```text
Browser
  |
  | Vue 3 + Vite single-page app
  | - route pages
  | - 3D/panorama viewers
  | - AI, friends, uploads, maps
  |
  +-- /api/chat -------------------- Qwen API + AMap Web Service + Supabase chat history
  +-- /api/auth/* ------------------ Supabase Auth account actions
  +-- /api/friends/* --------------- Supabase profiles, relationships, live locations
  +-- /api/groups/* ---------------- Supabase group chats and messages
  +-- /api/ugc --------------------- Supabase Storage + ugc_pois metadata
  |
Supabase
  |
  +-- Auth users
  +-- user_profiles
  +-- user_relationships
  +-- location_share_permissions
  +-- user_live_locations
  +-- group_chats / group_chat_members / group_chat_messages
  +-- ugc_pois and ugc-images storage bucket
  +-- conversations / chat_history
```

## Data Handling Evidence

Evidence for user input handling, interaction state management, and stored user records is collected in [data-handling-evidence](data-handling-evidence).

## Project Structure

```text
api/                  Local and Vercel API handlers
database/             Supabase SQL setup scripts
docs/                 Supporting implementation notes
image/                Panorama and scenic image assets
music/                Background audio assets for panorama roaming
public/               Static public files
scripts/              Development helper scripts
src/
  components/         Reusable Vue components
  components/friends/ Friend, location sharing, and group chat UI
  components/maps/    AMap route and shared map dialogs
  data/               Route, garden, panorama, POI, and localized content data
  lib/garden3d/       Three.js procedural garden scene engine
  router/             Vue Router routes
  services/           API, Supabase, friends, and map runtime services
  shared/             Shared logic tested by Node test runner
  views/              Page-level Vue views
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project for authentication, database, and storage features
- Optional: Qwen and AMap credentials for AI guide and route planning

### Install Dependencies

```bash
npm install
```

### Create Environment File

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Then fill in the required values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
FY_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional AI backend
QWEN_API_KEY=your-qwen-api-key

# Optional AMap route and map features
VITE_AMAP_KEY=your-amap-js-key
VITE_AMAP_SECURITY_CODE=your-amap-security-code
AMAP_WEB_SERVICE_KEY=your-amap-web-service-key
```

Do not commit `.env.local` or real API keys.

### Set Up Supabase

Run the SQL scripts in Supabase SQL Editor in this order:

```text
database/001_user_auth_schema.sql
database/002_group_chat_schema.sql
database/003_user_live_location.sql
database/004_app_feature_schema_and_demo_data.sql
```

The fourth script completes the full feature database setup. It creates:

- A public storage bucket named `ugc-images` with upload/read/delete RLS policies
- A table named `ugc_pois` for uploaded heritage photo metadata
- Tables named `conversations` and `chat_history` for persisted AI chat history
- Demo rows for profiles, accepted friends, live location sharing, group chat, uploaded heritage notes, and AI chat history

The core profile, friend, group chat, live location, UGC, and AI history tables are all created by the included SQL scripts.

### Demo Accounts

`database/004_app_feature_schema_and_demo_data.sql` also creates two Supabase Auth demo users for manual testing:

| User | Email | Password | Friend code |
| --- | --- | --- | --- |
| Demo Alice | `demo.alice@sucity.local` | `DemoPass2026!` | `DEMOALFA` |
| Demo Ben | `demo.ben@sucity.local` | `DemoPass2026!` | `DEMOBETA` |

Security-question reset answers:

| User | Favorite color | Birthday | Student ID |
| --- | --- | --- | --- |
| Demo Alice | `blue` | `2001-04-15` | `DEMO001` |
| Demo Ben | `green` | `2000-09-21` | `DEMO002` |

After running all four SQL files, sign in as either demo user to verify the full flow. The two demo users are already accepted friends, have active two-way location sharing, share one group chat with messages, each owns a UGC upload record, and each has a saved AI guide conversation. These credentials are for coursework/demo environments only; disable or replace them before using a real public production database.

### Run Locally

```bash
npm run dev
```

This starts:

- Local API server: `http://127.0.0.1:3000`
- Vite frontend: usually `http://127.0.0.1:5173`

The Vite dev server proxies `/api` requests to the local API server.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts backend and frontend together |
| `npm run dev:frontend` | Starts only the Vite frontend |
| `npm run dev:backend` | Starts only the local API server |
| `npm test` | Runs the Node.js test suite |
| `npm run build` | Builds the production frontend |
| `npm run preview` | Previews the production build locally |

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Pingjiang Road route hub |
| `/gardens` | Classical gardens route |
| `/zhuozheng` | Humble Administrator's Garden detail page |
| `/zhuozheng/panorama` | Humble Administrator's Garden panorama landing page |
| `/zhuozheng/panorama/viewer` | Humble Administrator's Garden panorama viewer |
| `/liu` | Lingering Garden detail page |
| `/liu/panorama/viewer` | Lingering Garden panorama viewer |
| `/wangshi` | Master of Nets Garden detail page |
| `/wangshi/panorama/viewer` | Master of Nets Garden panorama viewer |
| `/tianping` | Tianping Mountain page |
| `/pingjiang-road` | Pingjiang Road page |
| `/suzhou-museum` | Suzhou Museum page |
| `/museums` | Museums route |
| `/heritage` | Living heritage route |
| `/favorites` | Personal favorites page |

## API Summary

| Endpoint | Main Use |
| --- | --- |
| `/api/chat` | AI guide, conversation history, route planning support |
| `/api/auth/delete-account` | Authenticated account deletion |
| `/api/auth/reset-password` | Security-question password reset |
| `/api/friends` and `/api/friends/:action` | Friend code, requests, lists, blocking, live location sharing |
| `/api/groups` and `/api/groups/:action` | Group creation, messages, members, rename, exit |
| `/api/ugc` | Authenticated heritage photo upload and list retrieval |

## Testing and Build Check

Run these before submission:

```bash
npm test
npm run build
```

The current tests cover routing, localized views, panorama behavior, POI data, map dialog text, image fallback logic, friend location helpers, chat language handling, and selected component behavior.

## Deployment Notes

The repository is configured for Vercel deployment:

- `vercel.json` rewrites `/api/auth/:action`, `/api/friends/:action`, and `/api/groups/:action` to their serverless handlers.
- All other routes rewrite to `/` so Vue Router can handle client-side routing.
- Add the same environment variables from `.env.example` to the Vercel project settings.

For final marking, keep the deployed site public and active throughout the assessment period.

## AI Use and Coursework Disclosure

The coursework brief allows substantive AI assistance for the system and video, but the portfolio must explain:

- What prompts were used for core logic or major generated components
- How the team verified the implementation against user requirements
- Any ethical considerations, including accessibility, privacy, and bias
- Formal citations for each AI tool used

AI coding assistance logs are included in `ai-logs/`. The folder contains prompt summaries for the core generated or AI-assisted components, plus notes on human review and verification.

## Final Submission Checklist

- Replace all TODO links in this README.
- Run `npm test` and `npm run build`.
- Verify the deployed URL on desktop and mobile.
- Confirm Supabase, Qwen, and AMap environment variables are configured in deployment.
- Run all four SQL setup files, including `database/004_app_feature_schema_and_demo_data.sql`.
- Confirm storage bucket `ugc-images`, demo users, and required tables exist.
- Ensure `.env.local`, service keys, and private deployment files are not committed.
