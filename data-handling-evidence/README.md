# Data Handling Screenshot Evidence

This folder contains screenshot evidence showing how SuCity-Roam handles user input and interaction states.

The screenshots are stored in [screenshots](screenshots).

## Screenshot Explanation

| Screenshot | What the screenshot shows | Data handling evidence |
| --- | --- | --- |
| [frontend-auth-login-input.png](screenshots/frontend-auth-login-input.png) | The login dialog with email and password fields filled in. | Shows that the frontend captures user authentication input before sending it to the authentication system. |
| [frontend-ugc-form-image-selected.png](screenshots/frontend-ugc-form-image-selected.png) | The photo upload form after the user enters a scenic spot name, description, and selects an image. | Shows that the system manages form input state, selected image state, preview state, and submit controls before upload. |
| [frontend-ugc-success-preview.png](screenshots/frontend-ugc-success-preview.png) | The upload interface after submission, with the uploaded image shown back in the page. | Shows that the interface updates after processing user input and gives visible feedback to the user. |
| [database-ugc-pois-table.png](screenshots/database-ugc-pois-table.png) | The Supabase `ugc_pois` table containing uploaded POI records, descriptions, image URLs, coordinates, and timestamps. | Shows that uploaded community content is stored in the database after user submission. |
| [database-user-profiles-table.png](screenshots/database-user-profiles-table.png) | The Supabase `user_profiles` table containing user account/profile records. | Shows that user account data is stored and managed by the backend database. |

## Evidence Summary

These screenshots show the data-handling path from user interaction to stored data:

```text
User enters login/upload information
  -> frontend displays and manages the input state
  -> system processes the request
  -> database stores the resulting user or upload record
  -> frontend shows feedback or stored content preview
```

Together, the screenshots provide evidence that the system handles user input, manages interaction states, and stores relevant data rather than acting as a static website.
