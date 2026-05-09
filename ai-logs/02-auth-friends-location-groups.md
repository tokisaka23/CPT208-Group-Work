# Auth Friends Location And Groups

## Purpose

Record the prompts used to build Supabase login, friend codes, friend location sharing, and group chat.

## Primary Prompt Summary

```text
Connect the login and friend system to real Supabase data. Users should be able to sign up and sign in with email. After registration, write a profile into `user_profiles`; each user needs a username, display name, and unique friend code. Then implement friend requests, accept/reject actions, friend removal, blocking, and unblocking. Put the API handlers under `api/` and call them from Vue components.

Pay close attention to security: the service role key must only be used on the backend; users must not be able to edit other users' profiles; friend relationships should use `pending`, `accepted`, and `blocked` states; error messages should be understandable to users.
```

## Follow-Up Prompt Summary

```text
Continue adding the "visit together with friends" features. Two accepted friends should be able to enable location sharing. The friend list should show whether the friend is online, whether location sharing is enabled, coordinates, and update time. Also add group chat: users can only invite their accepted friends into a group; the owner can rename the group and remove members; members can send messages and leave the group. The mobile UI should be clear and include loading, empty, and error states.
```

## Assisted Components

- `api/auth.js`
- `api/friends.js`
- `api/groups.js`
- `api/supabase.js`
- `src/services/supabase/authRuntime.js`
- `src/services/friends/friendServiceRuntime.js`
- `src/services/friends/groupChatService.js`
- `src/components/friends/*`
- `database/001_user_auth_schema.sql`
- `database/002_group_chat_schema.sql`
- `database/003_user_live_location.sql`

## Human Review And Verification

- Verified all service-role operations remain server-side.
- Checked that users can only update their own profile and live location.
- Confirmed friend and group operations validate accepted-friend relationships before exposing state.
- Tested helper logic for location freshness, coordinates, and route summaries.
