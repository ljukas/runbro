# Brand palette — stage 4: brand art (icon, splash, welcome hero) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Dash R icon, the brand splash and the sunrise gradient on the onboarding welcome
hero, all in the same native build as stages 2–3, so the store screenshots can be taken.

**Architecture:** Asset swaps plus `app.json` fields for the icon and splash. The gradient's stops
join `brand-palette.json` through the generator (JS-only). The welcome hero gets the gradient two
ways:
- **iOS:** for free, because the welcome screen already shows `assets/images/icon.png`.
- **Android:** through a Skia gradient inside `OnboardingHero`'s clipped Compose `Box`. Compose has
  no gradient modifier.

**Tech Stack:** `expo-splash-screen` plugin options, `app.json` icon fields,
`@shopify/react-native-skia` `LinearGradient`, `RNHostView`.

**Spec:** [ADR 0027](../../adr/0027-brand-palette-accent-and-generated-material-scheme.md) §1 (the
gradient is decoration only), its 2026-10-17 amendment (the welcome hero is its only in-app place).
Also the roadmap's icon and splash rows, and [`docs/brand/`](../../brand/README.md).

**Stages:** [1](2026-10-17-brand-palette-stage-1-sources-and-data-marks.md) →
[2](2026-10-17-brand-palette-stage-2-ios-accent.md) →
[3](2026-10-17-brand-palette-stage-3-android-scheme.md) → **4 (this)**. Stacked on stage 3's PR.
After it merges, the next release PR carries the whole palette in one native build.

## Decisions for Lukas (settle before Task 1; the plan is written for the recommended option)

- **D1, the iOS icon format.**
  - **Recommended:** point `ios.icon` at `./assets/images/icon.png` (the opaque 1024 export) and
    delete `assets/expo.icon`. iOS 26 still applies its own glass treatment to a flat icon.
  - Alternative: author an Icon Composer `.icon` with the gradient and mark as layers, for the
    layered Liquid Glass look. That is manual work in Icon Composer; file it as a follow-up roadmap
    row.
- **D2, the splash in dark mode.**
  - **Recommended:** the same `#FF7A3D` with the white mark in both schemes. The mark is white, so
    a dark variant would need a second mark colour, and the splash is shown for under a second.
  - Alternative: a `dark` block with `backgroundColor` `#1C110C` (the generated dark `surface`),
    closer to the HIG's "launch screen resembles the first screen".
- **D3, the Android hero fallback.**
  - If Compose's `clip` doesn't clip the RN-hosted Skia canvas (Task 2, Step 2), the welcome clover
    keeps its solid `primaryContainer` (`#FF7A3D`, the gradient's mid).
  - **Recommended:** accept that rather than reshape the Android welcome page.

## Global Constraints

- **The gradient:** `#FFB224` → `#FF4256` at 135° (top-left → bottom-right), from
  `docs/brand/brand.json`. It never carries text or a control and never sits on chrome. The symbol
  on it is decorative (`importantForAccessibility="no-hide-descendants"`, as `ComposeSymbol` does).
- **Asset sources:** the asset files come from `docs/brand/exports/`, copied byte for byte, never
  re-rendered.
- **Adaptive icon:** `backgroundColor` becomes `#FF7A3D`. It's the fallback behind the background
  layer.
- **Splash:** `backgroundColor` `#FF7A3D`, `image` the brand `splash-icon.png`, `imageWidth` 76
  (the export is sized for it).
- **Rebuild:** native fields need `bun run prebuild:dev` / `prebuild:dev:android` (or `--clean`)
  before a build sees them. Both fingerprints move, as expected.

## Review Focus

1. **Android 13+ themed icons** use the monochrome layer. It must be the brand mark, not Expo's.
   → Task 1 check on the emulator with themed icons on.
2. **Font scale 2.0 on the Android welcome page:** the hero clamps its side
   (`Math.min(fontScale, 1.6)` upstream). The gradient canvas must fill the clipped shape at every
   size, with no visible square corners. → Task 2 check at `font_scale 2.0`.
3. **Light and dark welcome pages:** the gradient is identical in both (decoration, not a token),
   and the white symbol stays on it. → Task 2 check, both schemes.
4. **iOS 17.5** renders a flat PNG icon without iOS 26's glass. The home-screen icon must still be
   the Dash R, not a blank. → Task 3 on the `ios 17` simulator.
5. **The `development` and `e2e` variants** carry the same icon. A stale prebuild would keep Expo's
   icon in one variant. → Task 3 checks a fresh `e2e-refresh` build's icon too.

---

### Task 1: Icon and splash

**Files:**
- Replace: `assets/images/icon.png`, `assets/images/android-icon-{foreground,background,monochrome}.png`,
  `assets/images/splash-icon.png` (from `docs/brand/exports/`)
- Delete: `assets/expo.icon/` (D1)
- Modify: `app.json`: `ios.icon` → `./assets/images/icon.png`;
  `android.adaptiveIcon.backgroundColor` → `#FF7A3D`; `expo-splash-screen` `backgroundColor` →
  `#FF7A3D`

- [ ] **Step 1:** copy the five exports over the asset files and apply the `app.json` edits
  (D1, D2).
- [ ] **Step 2:** run `bun run prebuild:dev -- --clean` and `bun run prebuild:dev:android -- --clean`.
  Build both dev clients (iOS: `bun run start`; Android: the arm64 Gradle recipe and
  `adb install -r`).
- [ ] **Step 3: Check with argent screenshots** (home screen via `button home`, the splash via
  `restart-app`):
  - the iOS home-screen icon and the splash, light and dark;
  - the Android launcher icon, the themed icon (Settings → Wallpaper & style → Themed icons) and
    the splash.
- [ ] **Step 4:** record the fingerprints. Commit with `feat: Dash R app icon and brand splash`.

### Task 2: The sunrise gradient on the Android welcome hero

**Files:**
- Modify: `scripts/generate-brand-palette.ts`, `src/constants/brand-palette.json` (regenerated)
- Modify: `src/constants/brand-palette.test.ts`
- Modify: `src/components/onboarding-hero.android.tsx`
- Modify: `src/app/onboarding/index.android.tsx` (the welcome page passes `fill="sunrise"`)

**Interfaces:**
- Produces: `palette.gradient = { from: '#FFB224', to: '#FF4256', angleDeg: 135 }`.
- Produces: `OnboardingHero` takes an optional `fill?: 'container' | 'sunrise'` (default
  `'container'`). `sunrise` draws the gradient under the symbol, and the symbol tint becomes
  `#FFFFFF`.

- [ ] **Step 1: Write the test** `the gradient matches the brand file`: the palette's `gradient`
  equals `docs/brand/brand.json`'s stops and angle (read with `node:fs`). Regenerate. Run.
  Expected: PASS.
- [ ] **Step 2: Spike the clip.**
  - Inside the existing clipped `Box`, put an `RNHostView` holding a Skia `Canvas` (`flex-1`). In
    it, a `Rect` fills the canvas with a `LinearGradient` from `vec(0, 0)` to `vec(side, side)`
    (135°).
  - Put `ComposeSymbol` after it, so it draws on top.
  - Look at the welcome page on the emulator: are the clover's lobes clipped?
  - If they are, keep it. If not, apply D3 (drop `fill="sunrise"`) and record the measured
    behaviour in ADR 0027 as a dated amendment.
- [ ] **Step 3: Check the Review Focus 2 and 3 cases** (`font_scale 2.0`, light and dark), then
  `bun run typecheck:android` and lint.
- [ ] **Step 4: Commit** with `feat(android): sunrise gradient on the onboarding welcome hero`.

### Task 3: Verification, docs and handoff

- [ ] **Step 1: On iOS 26.5 and `ios 17` simulators,** reset onboarding and check the welcome hero:
  it now shows the gradient icon. Check the home-screen icon (Review Focus 4).
- [ ] **Step 2: Run `e2e-refresh`.** Native changed, so it's a full build. Then run the
  `onboarding` tag and `complete-session`. Check the `e2e` app's home-screen icon (Review Focus 5).
- [ ] **Step 3: Update the docs.**
  - Roadmap: the icon and splash rows become **Built**, and the brand-colours row states stages
    1–4.
  - `docs/brand/README.md`: replace "Status: designed, not yet in the app".
  - ADR 0025's stage table notes: no change.
  - ADR 0027: append a note to the amendment if D1–D3 landed differently from the recommendation.
- [ ] **Step 4:** run the reviewers and open the PR, titled
  `feat: brand palette stage 4 — icon, splash and the welcome gradient`.
- [ ] **Step 5: Hand off.** Store screenshots (light and dark, both platforms) are unblocked; they
  are the Play listing work in `docs/roadmap/README.md`, not this plan.
