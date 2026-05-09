# Localization Accessibility And Mobile UI

## Purpose

Record the prompts used to translate the interface, clean hardcoded copy, and polish mobile layouts.

## Primary Prompt Summary

```text
Refactor the hardcoded Chinese copy into multilingual content. Major pages and components should support Chinese, English, Japanese, and Korean, including the home routes, garden pages, museum pages, living heritage pages, favorites/upload pages, map dialogs, AI guide, friends, and group chat. Avoid repeating copy across many files; move reusable content into `siteContentI18n` or the relevant i18n helper.

Also check accessibility and user states: button labels should be clear, and loading, empty, error, and success states should be visible so users do not click and receive no feedback.
```

## Follow-Up Prompt Summary

```text
Focus on fixing the mobile experience. The site should feel like an app, not a desktop webpage squeezed onto a phone. Add bottom navigation and a service panel, place buttons where thumbs can reach them, remove unrelated floating global buttons from panorama roaming pages, prevent text overflow and overlapping, and make sure favorites, uploads, and map dialogs are readable and usable on mobile. Add tests to make sure routes, copy, and mobile layout are not broken.
```

## Assisted Components

- `src/i18n/index.js`
- `src/data/siteContentI18n.js`
- `src/views/*I18n.vue`
- `src/views/localizedRouteViews.test.js`
- `src/views/aggregateLocalizedViews.test.js`
- `src/views/favoritesLocalizedView.test.js`
- `src/components/maps/scenicMapDialogI18n.js`
- `src/components/ugcSubmitI18n.js`
- `src/App.vue`

## Human Review And Verification

- Checked that visible UI strings resolve from localized sources.
- Added tests for localized route content and favorites/upload copy.
- Reviewed mobile states for panorama routes, bottom navigation, and service panels.
- Confirmed user-facing errors are visible instead of silently swallowed.
