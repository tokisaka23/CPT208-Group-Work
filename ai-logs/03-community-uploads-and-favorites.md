# Community Uploads Favorites And Media Assets

## Purpose

Record the prompts used for UGC uploads, image processing, WebP/JPG assets, and audio conversion.

## Primary Prompt Summary

```text
Build a community upload feature. A logged-in user should be able to upload one heritage photo, enter a title and description, and automatically capture the current location after the page loads. Save the image in the Supabase Storage `ugc-images` bucket, and save the title, description, image URL, latitude, and longitude in `ugc_pois`. Users should be able to view and delete their own uploads; accepted friends should be able to open the favorites page and view each other's uploads in read-only mode.

Include input validation, upload-failure messages, login-state checks, a Storage path strategy, and database RLS policies.
```

## Follow-Up Prompt Summary

```text
Help me reduce asset size. Downscale oversized garden images and convert them to WebP, while keeping JPG fallbacks so mobile loading is faster and browsers that reject WebP can still display the scene. Before UGC upload, check image type and size and compress when needed. Another task is to convert background music/audio assets into browser-stable MP3 files and confirm panorama pages can resume playback after the user's first click, so autoplay restrictions do not leave the page silent.
```

## Assisted Components

- `api/ugc.js`
- `src/components/UgcSubmit.vue`
- `src/components/UgcSubmit.test.js`
- `src/components/UgcMyList.vue`
- `src/components/UgcMyListI18n.vue`
- `src/views/FavoritesView.vue`
- `src/views/FavoritesViewI18n.vue`
- `src/components/ugcSubmitI18n.js`
- `src/shared/imageFallback.js`
- `src/data/gardenImages.js`
- `music/*.mp3`
- `database/004_app_feature_schema_and_demo_data.sql`

## Human Review And Verification

- Checked file size and MIME validation.
- Verified uploaded metadata uses the authenticated user ID.
- Added RLS policies for own uploads and accepted-friend read access.
- Tested localized copy, read-only friend-view behavior, WebP/JPG fallback logic, and background music resume behavior.
