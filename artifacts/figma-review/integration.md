# Figma proposal integration

## Implemented

1. `01-headline-actions.png`: Overview walkthrough becomes a keyboard-operable text-style button under the subtitle. Import/Export remain real actions; desktop visually shows Export then Import, phone shows Import then Export. The tour button retains a 44px hit area rather than copying a tiny link hitbox. Other page mastheads are unchanged.
2. `02-proof-rail.png`: remove the filled surface/rounded card; use top/bottom dividers, tabular 22px numerals and mobile two-column flow. First metric is selected raw rows with selected distinct texts beneath. Provider and human-reviewed counts remain computed from current filtered data, not constants. Preserve precise labels `texts with Adaption analysis` and `texts with reviewed labels`; imports are not relabelled as provider results.
3. `03-mobile-evidence.png`: omit the duplicate fixed Import bar on Overview, where the masthead already provides Import. Remove its excess bottom spacer on that page. Keep hero action in normal flow with >=44px target, narrow-screen 25/30px headline, 13/22px paragraph and original responsive gutters. Keep desktop Three.js/mobile SVG and all motion preference gates. Do not reproduce the illustrative mockup's large empty vertical gap.

The fixed import control on other workspace pages remains intentionally unchanged because their mastheads do not universally duplicate Import. No data engine, provider policy, persistence, source quotes or evaluation claims changed.

## Files

- web/app.mjs — additive masthead accessory/class support, Overview composition, dynamic proof rail markup, Overview-only CTA removal.
- web/style.css — bounded Figma refinement rules; no design-system replacement.
- scripts/readiness-check.mjs — expect no fixed CTA on Overview; still verify existing CTA elsewhere.
- scripts/figma-check.mjs — new browser regression at 1440/1024/390/320px.
- Generated audit files/screenshots refreshed by actual suite runs.

## Actual verification

The new Figma test first failed against the previous preview (`walkthrough is not a third masthead button`, 1 versus 0), then passed after implementation/build/restart.

- npm test: 53 passed, 0 failed.
- npm run lint: exit 0.
- npm run build: exit 0.
- QA_PACKAGE_ROOT=/home/linux/.hermes/cache/scratch/build-battle-qa node scripts/figma-check.mjs: exit 0; 4 widths. Keyboard tour, single Overview Import, non-card rail, mobile action order, touch target, uncluttered hero, selected 1,800-row Operational Issues count, unchanged provenance under all-row/distinct toggle, analysis navigation, no overflow or tested Axe violations.
- Same QA root node scripts/motion-check.mjs: exit 0; actual software-WebGL rendering, pause/resume/navigation cleanup/fallback; mobile/reduced-motion/Save-Data safeguards retained.
- Same QA root + QA_BASE_URL=http://127.0.0.1:8787 node scripts/readiness-check.mjs: exit 0; 16 critical assets, 30 page/viewport checks and real form/import/export/consent workflows.
- Same QA root/base node scripts/browser-check.mjs: exit 0; 30 workspace/width checks; no page errors/request failures/overflow or tested Axe violations.
- Same QA root node scripts/journey-check.mjs: exit 0; source integrity, human review/provenance protection, owner/status persistence and real downloaded briefs at 1440/390/320.

Actual implementation screenshots are `implemented/overview-{1440,1024,390,320}.png`. These are static-fallback captures for layout checks. `../motion/overview-1440.png` shows the actual desktop WebGL render. Screenshots inspected visually at desktop/390/320; no text truncation or button overlap observed. Axe is not accessibility certification; software-WebGL is not real-device FPS certification.

## Rubric and shipping

UI/UX: less competing masthead chrome and no mobile fixed obstruction. Functionality/UX: evidence journey and actionable controls remain tested. Problem understanding: provenance remains exact, filtered and source-aware. Technical: no framework changes or new dependencies. Presentation: three-minute tour is clearer without being the primary workspace action.

Latest integration is local and uncommitted, not pushed/deployed. Earlier submission archives remain outdated. No external publication, access-policy changes, paid provider calls or credits were used.
