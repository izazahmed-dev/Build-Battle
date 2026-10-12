# Motion enhancement — implemented and verified

## Delivered

Original procedural Three.js 0.186.1 optical study in the existing Overview hero. GSAP 3.15.0 + ScrollTrigger positional reveals. Locally bundled/split by esbuild 0.28.2 without changing Vinext/Vite/Workers or server bindings. Existing SVG/content remains the fallback. No Rive, Lenis, Webflow, copied models, reference-site shaders or CDN assets.

Core files: web/evidence-lens.mjs, web/motion-entry.mjs, web/motion-loader.mjs, web/app.mjs, web/style.css, scripts/prepare-web.mjs, scripts/motion-check.mjs, scripts/readiness-check.mjs, package.json/package-lock.json. Attribution in web/assets/THREE-LICENSE.txt and MOTION-NOTICES.txt. README.md and web/ARCHITECTURE.md describe boundaries. Manual Figma prompt is artifacts/figma-art-direction.md.

## Actual verification (2026-10-12, final local release)

- npm test: 53 pass, 0 fail.
- npm run lint: exit 0.
- npm run build: exit 0.
- QA_PACKAGE_ROOT=/home/linux/.hermes/cache/scratch/build-battle-qa node scripts/motion-check.mjs: exit 0. Actual software-WebGL rendering, pause/resume, three repeated route cycles, context-loss fallback; reduced motion, Save-Data, mobile 390/320 and disabled GPU covered; zero page errors and tested Axe violations.
- QA_PACKAGE_ROOT=... QA_BASE_URL=http://127.0.0.1:8787 node scripts/readiness-check.mjs: exit 0. 16 asset status/MIME checks, 30 page/viewport checks, real feedback/reload, export, invalid import/evidence, analytics consent/withdrawal and DNT.
- QA_PACKAGE_ROOT=... QA_BASE_URL=http://127.0.0.1:8787 node scripts/browser-check.mjs: exit 0. 30 view/width combinations, no detected overflow, page errors, request failures or tested Axe violations.
- QA_PACKAGE_ROOT=... node scripts/journey-check.mjs: exit 0. 1440/390/320px exact-source correction, retained provider lineage, protected manual import, disagreement handoff, owner/status reload and actual brief download.

Software Chromium rendering is NOT real-device FPS/GPU certification. Automated Axe checks are NOT accessibility certification. Initial shared Windows dependency installation hit EBUSY; browser libraries were installed in isolated Linux scratch, then added using locked package metadata. No lockfile deletion or shared native-dependency reset.

## Size and behavior

Final build has one motion entry: 116,319 bytes raw / 45,903 gzip, and one Three.js scene chunk: 543,255 raw / 137,357 gzip. These are locally computed gzip sizes, not measured hosting transfer bytes. Old hashed generated motion chunks are removed on build only inside owned public/motion; running preview snapshot isolation remains unchanged. Desktop >=1000px loads the lens only when visible. Mobile requests the GSAP entry but no Three.js chunk. Reduced motion/Save-Data request neither. Canvas is decorative/aria-hidden. Native scrolling, keyboard pause button, approximately 30fps scheduling, capped DPR, offscreen/hidden-tab suspension and disposal on route rerender/navigation.

## Rubric tradeoffs

- UI/UX (20%): distinctive instrument-like artwork and restrained hierarchy; no full-screen loading gate or scroll-jacking.
- Innovation (15%): original geometry supports inspectability; does not masquerade as AI/data visualization.
- Technical (15%): code splitting, feature/preference gates, teardown, GPU failure recovery, deterministic core retained.
- Functionality/UX (25%): all decision-chain checks retained; motion never determines correctness or gates interactions.
- Problem understanding (15%): no changes to source data, priorities, provider evaluation or factual limits.
- Demo (10%): use the art as a brief visual introduction, then prove source→priority→correction→owner→export. Do not spend the demo on animation.

## Remaining

Latest work is local and uncommitted; not pushed or deployed. Existing source ZIP and deployment archive predate this enhancement and must not be submitted as though they contain it. Fresh packaging/clean-start and hosted access verification remain shipping work. Human test on the entrant's actual browser/GPU and final demo recording remain required. No provider calls/credits or audience changes were made in this pass.
