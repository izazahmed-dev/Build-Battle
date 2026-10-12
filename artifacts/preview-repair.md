# Repaired production-preview asset failure

## Reproduction

The running production preview returned HTTP 200 for `/feedback`, but HTTP 500 for `/style.css`, `/app.mjs`, `/privacy.mjs` and `/site-config.mjs`. The dev preview served the same assets correctly. The browser therefore displayed the unstyled server loading fallback rather than the application.

The previous preview served directly from `dist`. A subsequent build replaced that directory while Wrangler retained its earlier static-asset mapping. Earlier browser checks passed before that later rebuild; they did not prove the preview would remain healthy after it.

## Fix

- `npm run start` invokes `scripts/start-preview.mjs`.
- `scripts/preview-release.mjs` copies the built worker and client into one immutable, isolated `.preview/release-*` directory before starting Wrangler.
- The worker and asset directory remain a matched release even when another build replaces `dist`.
- Preview shutdown forwards signals to its owned process group and removes only its own release directory.
- `.preview` is ignored by Git and ESLint.
- Readiness checks now fail promptly when critical static assets return an error or wrong MIME type, instead of accepting successful HTML alone.

## Verification

- Rebuilt `dist` while the new production preview remained running.
- Production readiness checks passed afterward: 12 asset status/MIME checks, 30 page/viewport checks and functional/consent/export flows, with zero page errors.
- 42 automated tests passed, including a regression that replaces source build assets while preserving the first preview snapshot.
- Lint and production build passed.
- Actual Chromium render at `/feedback?demo=1`: 15 visible review rows, DM Sans styling, connected judge-preview state and no loading shell.
- Exact private `/feedback` route also rendered 15 rows.
- Screenshots: `repaired-feedback-1440.png` and `repaired-feedback-390.png` in `artifacts/readiness`.

The hosted website was not redeployed. The previously interrupted submission ZIP remains incomplete and must not be submitted.
