# Database Schema Demo Data And Submission Docs

## Purpose

Record the prompts used to make the database setup, demo users, README, and coursework evidence complete.

## Primary Prompt Summary

```text
Add a complete database table-creation SQL file. We already have part of the login, friend, group chat, and location-sharing setup, but the app also needs `ugc_pois`, `conversations`, `chat_history`, and the `ugc-images` bucket. Create `database/004_app_feature_schema_and_demo_data.sql` and include these tables, indexes, triggers, RLS policies, and storage policies.

Also create two demo users that cover all features: they can sign in, have security-question answers, are accepted friends, can see each other's location, are in the same group chat, have group messages, each has a UGC upload record, and each has AI chat history. The SQL should be safe to rerun where practical and must not include real secrets.
```

## Follow-Up Prompt Summary

```text
After adding the database setup, check the schema against the app code. Confirm that every Supabase table referenced by the API or frontend exists, that storage policies allow UGC uploads and public image reads, that demo rows cover the main feature flows, and that the SQL seed data can be used by assessors without real private credentials.
```

## Assisted Components

- `database/004_app_feature_schema_and_demo_data.sql`
- `database/fullFeatureSchemaReadme.test.js`
- `README.md`

## Human Review And Verification

- Confirmed the script is idempotent where possible through `create table if not exists`, `create policy` replacement, and `on conflict` seed behavior.
- Confirmed demo users cover auth, friend list, live location sharing, group chat, UGC records, and AI chat history.
- Added a test to ensure the SQL file and README keep the required setup evidence visible.
- Ran `npm test` and `npm run build`.
