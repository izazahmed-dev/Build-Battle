# InsightFlow brand assets

Created original, local brand assets in `web/assets/`. No stock imagery, paid image generation, invented customer metrics, or fabricated chart data.

## Art direction

- Editorial ivory composition (`#f5f4ef`), ink typography (`#252a24`), forest brand marks (`#2a3629`), restrained burnt-orange connector (`#bb4225`).
- OG copy: **InsightFlow** / **Customer feedback. Clear priorities.** / **Evidence behind every decision.**
- Abstract evidence slips converge into one brand-mark decision; the motif represents a concept, not a product screenshot or measured data.
- Typography uses the actual repository's self-hosted Manrope and DM Sans WOFF2 files, converted in memory for local Pillow rendering.
- Icons preserve the supplied three-stroke glyph: `M11 25V15 m9 15V10 m9 15V15`, with rounded strokes. Opaque forest app icons avoid platform-added transparency artifacts; SVG uses a rounded forest container.

## Verified outputs

All paths below are relative to the repository root. PNG files were reopened, fully pixel-decoded, and checked with Pillow `verify()`. ICO entries were individually decoded. Dimensions are from actual output-file reads, not planned dimensions.

| Path | Format | Verified dimensions | File size (bytes) |
| --- | --- | --- | ---: |
| `web/assets/og-image.png` | PNG RGB | 1200 × 630 | 82489 |
| `web/assets/favicon.svg` | Valid SVG XML | 40 × 40 / viewBox 0 0 40 40 | — |
| `web/assets/favicon-16.png` | PNG RGB | 16 × 16 | 446 |
| `web/assets/favicon-32.png` | PNG RGB | 32 × 32 | 649 |
| `web/assets/apple-touch-icon.png` | PNG RGB | 180 × 180 | 2143 |
| `web/assets/android-chrome-192.png` | PNG RGB | 192 × 192 | 2513 |
| `web/assets/android-chrome-512.png` | PNG RGB | 512 × 512 | 7045 |
| `web/assets/favicon.ico` | ICO | embedded 16 × 16, 32 × 32, 48 × 48 | 1995 |
| `web/assets/site.webmanifest` | Valid JSON | not applicable | — |

The OG image was visually inspected: no clipped text, clear primary headline, coherent glyph, ample whitespace, and aligned evidence-to-decision motif.

## Integration contract

- OG public path: `/assets/og-image.png`.
- Manifest icon URLs are same-origin `/assets/android-chrome-192.png` and `/assets/android-chrome-512.png`; purpose is explicitly `any` (not falsely advertised as maskable).
- Manifest `start_url` and `scope`: `/`; `display`: `standalone`.
- Manifest `background_color`: `#f5f4ef`; `theme_color`: `#2a3629`.
- Parent agent owns template/meta integration and deployment copying. No CSS, templates, or preparation scripts were edited.

## Tooling note

Pillow rendered at supersampled resolution and downsampled with Lanczos. FontTools and Brotli were initially unavailable, then installed successfully in the agent's Python environment to use the existing brand fonts. No unresolved asset-generation issues remain.
