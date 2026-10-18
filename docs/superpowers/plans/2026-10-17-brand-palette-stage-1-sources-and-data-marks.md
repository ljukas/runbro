# Brand palette — stage 1: palette sources and data marks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One generator writes both palette files, a `bun test` holds every colour to ADR 0027's
rules, and the run data (segments, chart, stat tiles, route) takes the pinned colours on both
platforms.

**Architecture:** `scripts/generate-brand-palette.ts` holds the pinned values and computes the
Material scheme. It writes `plugins/brand-accent.json`, which stage 2's config plugin will
require, and `src/constants/brand-palette.json`, which only JS imports. `theme.ts` builds
`SegmentColors`/`StatColors` from the JS-only file. Pure colour maths (`src/domain/color-metrics.ts`)
backs the rule tests. JS-only stage: no native change, OTA-eligible.

**Tech Stack:** Bun, `@material/material-color-utilities` 0.4.0 (devDependency), Skia
(`DashPathEffect`), expo-maps polylines.

**Spec:** [ADR 0027](../../adr/0027-brand-palette-accent-and-generated-material-scheme.md) §1, §3,
§5 and its 2026-10-17 amendment, which pins every value below.

**Stages:** **1 (this)** → [2 — iOS accent](2026-10-17-brand-palette-stage-2-ios-accent.md) →
[3 — Android scheme](2026-10-17-brand-palette-stage-3-android-scheme.md) →
[4 — brand art](2026-10-17-brand-palette-stage-4-brand-art.md). Each stage is one PR, stacked on the
previous one, and leaves a working app. ADR 0027 ships the palette with the icon and splash in one
native build, so don't merge a release PR between stage 2 and stage 4. Stage 1 alone may ship OTA.

## Global Constraints

- **Pinned values:** these come from the amendment. Don't regenerate or "improve" them; a change
  goes through the generator and the rule tests.
  - run `#C75115` / `#FF7A3D`; walk `#636366` / `#8E8E93`;
  - warm-up and cool-down `#0A7C8C` / `#40C8E0`; stopped `#5856D6` / `#7D7AFF`;
  - pace `#AF0F8A` / `#FF97D8`; elevation `#008954` / `#00D385`;
  - Material seed `#FF7A3D`, `SchemeContent`, contrast level 0.
- **iOS accent:** stage 1 writes these to `plugins/brand-accent.json` and stage 2 consumes them. Light
  / dark / light HC / dark HC:
  - `primary` `#BC4A0C` / `#FF7A3D` / `#A53C00` / `#FFB598`;
  - `primaryForeground` `#FFFFFF` / `#000000` / `#FFFFFF` / `#000000`;
  - `primaryFill` `#BC4A0C` / `#C75115` / `#A53C00` / `#FFB598`;
  - `primaryFillForeground` `#FFFFFF` / `#FFFFFF` / `#FFFFFF` / `#000000`.
- **No `package.json` script** for the generator. It runs as `bun scripts/generate-brand-palette.ts`,
  because `scripts` is a fingerprint source (ADR 0027 §3).
- **Imports:** no module reachable from `bun test` may import Expo or React Native (AGENTS.md).
  `theme.ts` keeps type-only imports.
- **Fingerprints:** iOS and Android must not move in this stage. Measure with
  `bunx expo-updates fingerprint:generate --platform <p> | jq -r .hash` before and after.
- **Comments:** WHY-only (AGENTS.md "Comments & documentation"). Rewrite the stale ones in the
  `theme.ts` and `run-summary-headline.tsx` blocks you touch.
- **Android surfaces:** Android's cards stay wallpaper-derived until stage 3, while the rule tests
  already measure the generated `SchemeContent` surfaces the app will have from then on. A
  wallpaper card that renders a data colour faintly on the emulator in this stage is expected, not a
  failure.

## Review Focus

1. **A route chunk with no matching segment row** draws as walk (ADR 0021 §4). It must still get a
   casing, under every line. → Task 4 test `unmatched chunk is cased walk`.
2. **A session with only a warm-up, or only a cool-down,** shows one "Warm Up / Cool Down" swatch,
   never two and never none. → Task 3 test `legend merges warm-up and cool-down`.
3. **A hand edit to either JSON** without re-running the generator must fail CI. → Task 1 test
   `committed palette files match the generator`.
4. **The theme switches while the summary is open.** The casing colour comes from `useTheme()`, so
   `useStyledRoute`'s memo has to depend on it, or the casing stays light on dark tiles. → Task 4
   step, checked on device.
5. **A stat tile without a colour** (Active Time, Distance, Moving Time) renders a secondary glyph
   and label, never `undefined` passed to `tintColor`. → Task 3 step, checked on device.

---

### Task 1: Colour maths and the generator

**Files:**
- Create: `src/domain/color-metrics.ts`, `src/domain/color-metrics.test.ts`
- Create: `scripts/generate-brand-palette.ts`
- Create (generated, committed): `plugins/brand-accent.json`, `src/constants/brand-palette.json`
- Create: `src/constants/brand-palette.test.ts` (this task adds only the generator test)
- Modify: `package.json`, `bun.lock` (via `bun add -d @material/material-color-utilities@0.4.0`)

**Interfaces:**
- Produces, in `src/domain/color-metrics.ts`:
  - `type Vision = 'normal' | 'protan' | 'deutan' | 'tritan'`, `const VISIONS: readonly Vision[]`
  - `type Lab = readonly [number, number, number]`
  - `contrastRatio(a: string, b: string): number` (WCAG 2.x, `#RRGGBB` in)
  - `toLab(hex: string, vision?: Vision): Lab`: sRGB → linear. Machado 2009 at severity 1.0 runs in
    linear RGB, clamped to 0–1. Then CIE Lab, D65.
  - `deltaE00(a: Lab, b: Lab): number` (CIEDE2000, kL = kC = kH = 1)
  - `minDeltaE00(a: string, b: string): { deltaE: number; vision: Vision }`, the worst case over
    `VISIONS`
- Produces, in `scripts/generate-brand-palette.ts`: `buildBrandPalette(): { accent: BrandAccent;
  palette: BrandPalette }`. It writes both files only under `import.meta.main`.
- Produces the JSON shapes later stages import:
  - `plugins/brand-accent.json`: `{ primary, primaryForeground, primaryFill, primaryFillForeground }`.
    Each is `{ light, dark, lightHighContrast, darkHighContrast }`.
  - `src/constants/brand-palette.json`:
    - `seed: string`;
    - `scheme: { light, dark }`. Each holds every role name `@expo/ui`'s `MaterialColors` type
      declares (`node_modules/@expo/ui/build/jetpack-compose/colors.d.ts`), with
      `MaterialDynamicColors` values.
    - `segments: { light, dark }`, each `{ run, walk, warmupCooldown, stopped }`;
    - `stats: { light, dark }`, each `{ pace, elevation }`.
  - All hex values are `#RRGGBB` uppercase. Output is `JSON.stringify(v, null, 2) + '\n'`.

- [ ] **Step 1: Write the failing maths tests** in `color-metrics.test.ts`. Anchor them on
  published and ADR numbers:
  - `deltaE00([50, 2.6772, -79.7751], [50, 0, -82.7485])` ≈ 2.0425, and
    `deltaE00([50, 0, 0], [50, -1, 2])` ≈ 2.3669 (Sharma 2005, `toBeCloseTo(_, 4)`).
  - `contrastRatio('#FFFFFF', '#BC4A0C')` ≈ 5.09; `contrastRatio('#8E8E93', '#F0F0F3')` ≈ 2.87
    (`toBeCloseTo(_, 2)`).
  - `minDeltaE00('#B2A300', '#FF7A3D')` → `{ deltaE ≈ 3.06, vision: 'deutan' }`.
  - `minDeltaE00('#8E8E93', '#0A7C8C')` → `{ deltaE ≈ 11.58, vision: 'protan' }`. This is the ADR's
    light segment minimum.
- [ ] **Step 2:** `bun test src/domain/color-metrics.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement `color-metrics.ts`.** The Machado matrices, linear RGB, severity 1.0:
  ```
  protan [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]
  deutan [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.01182,0.04294,0.968881]]
  tritan [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.3039]]
  ```
  Use sRGB → XYZ D65 (`0.4124564 …`) and the CIE Lab cube-root with ε = 216/24389.
- [ ] **Step 4:** re-run. Expected: PASS.
- [ ] **Step 5: Install the dependency and write the generator.**
  - Run `bun add -d @material/material-color-utilities@0.4.0`.
  - In the generator, the scheme is `new SchemeContent(Hct.fromInt(argbFromHex(SEED)), isDark, 0)`.
    Each role is `hexFromArgb(MaterialDynamicColors[role].getArgb(scheme))`.
  - The role list is a `const` array typed against `keyof MaterialColors` (a type-only import from
    `@expo/ui/jetpack-compose`), so a role `@expo/ui` adds or drops fails typecheck.
  - The pinned accent, segment and stat values are constants in this file. It is the only place a
    hex is typed by hand.
- [ ] **Step 6:** run `bun scripts/generate-brand-palette.ts` and commit both outputs. Spot-check
  `scheme.light.primary` = `#A53C00`, `scheme.light.primaryContainer` = `#FF7A3D`,
  `scheme.light.surfaceContainerHighest` = `#F5DED6` and `scheme.dark.surfaceContainerHighest` =
  `#40322C`.
- [ ] **Step 7: Write `brand-palette.test.ts`'s first test,** `committed palette files match the
  generator`. It deep-equals `buildBrandPalette()` against both imported JSON files. Run it.
  Expected: PASS. Then hand-edit one hex and confirm the test fails.
- [ ] **Step 8:** confirm both fingerprints are unchanged (Global Constraints). Commit with
  `feat: generate the brand palette sources and colour metrics`.

### Task 2: The rule tests

**Files:**
- Modify: `src/constants/brand-palette.test.ts`

**Interfaces:**
- Consumes: `color-metrics` (Task 1), both JSON files, `Colors` from `@/constants/theme`.
- Consumes `Hct.fromInt` from the devDependency, for hue.

The surfaces are a table in the test. Write it once and use it in every assertion. For each scheme:

| Surface | Colours | Backgrounds |
|---|---|---|
| `segments` (bar, legend, splits) | run, walk, warmupCooldown, stopped | iOS `backgroundCard`, `backgroundElement`; scheme `surfaceContainerHighest`, `surfaceContainerHigh` |
| `chart` | pace, elevation, run, walk, stopped | iOS `backgroundCard`; scheme `surfaceContainerHighest` |
| `stats` | run (as `running`), pace, elevation | iOS `backgroundCard`; scheme `surfaceContainerHighest` |
| `screen` (run screen, route casing) | run, walk, warmupCooldown, stopped | iOS `background`; scheme `surface` |

- [ ] **Step 1: Write the tests.**
  - `every data colour clears 3:1 on every background of its surface`.
  - `every pair on one surface stays ≥ 10 ΔE00 under every vision`. The failure message names the
    pair, the surface and the `vision`.
  - `only run sits on the brand hue`: every non-run data colour with HCT chroma ≥ 10 sits ≥ 45° of
    hue from run's, per scheme.
  - `each label clears 4.5:1 on its fill in every variant`: `primaryForeground` on `primary`, and
    `primaryFillForeground` on `primaryFill`, over the four accent variants.
  - `primary as text clears 4.5:1 on background, grouped and card`, per scheme, standard and
    high-contrast. Use iOS `Colors` backgrounds. `backgroundElement` is deliberately absent (4.48:1,
    amendment).
  - `global.css tokens equal Colors`:
    - parse each `@variant light|dark { … }` block of `src/global.css` for `--color-*: #…;` (read it
      the way `src/db/derived-finalize.test.ts` reads files);
    - map names with a table, because `text` ↔ `foreground` and `textSecondary` ↔
      `foreground-secondary`; the rest are kebab ↔ camel;
    - assert both directions, case-insensitively, so a token missing on either side fails.
- [ ] **Step 2:** `bun test src/constants/brand-palette.test.ts`. Expected: PASS on the committed
  values. The measured minimums to expect in a debug print are: segments 11.5 / 17.8, chart
  12.2 / 13.2. Any failure here means the JSON or the maths drifted; don't loosen a threshold.
- [ ] **Step 3: Commit** with `test: hold the brand palette to ADR 0027's contrast and CVD rules`.

### Task 3: Segment and stat colours from the palette

**Files:**
- Modify: `src/constants/theme.ts` (`SegmentColors`, `StatColors`, new `ROUTE_CASING_W`)
- Create: `src/domain/segment-legend.ts`, `src/domain/segment-legend.test.ts`
- Modify: `src/components/segment-legend.tsx`
- Modify: `src/components/stat-grid.ios.tsx`, `src/components/stat-grid.android.tsx`
- Modify: `src/components/run-stat-grid.tsx`, `src/components/free-run-stat-grid.tsx`
- Modify: `src/components/run-profile-card.tsx`
- Modify: `src/components/run-summary-headline.tsx:24`

**Interfaces:**
- Produces, in `theme.ts`:
  - `SegmentColors: Record<'light'|'dark', Record<StoredSegmentKind, string>>`, built from
    `palette.segments`, with `warmup` and `cooldown` both `warmupCooldown`;
  - `StatColors: Record<'light'|'dark', { running: string; pace: string; elevation: string }>`,
    where `running` is `palette.segments[scheme].run`;
  - `ROUTE_CASING_W = 3`.
- Produces `segmentLegendEntries(kinds: Iterable<StoredSegmentKind>): { kind: StoredSegmentKind;
  label: string }[]`, in `ORDER`. When `warmup` or `cooldown` is present, one entry with kind
  `warmup` and label `'Warm Up / Cool Down'` takes the warm-up position. Other labels come from
  `SEGMENT_KIND_LABEL`.
- Produces: `StatGrid.Tile`'s `color` becomes optional (`color?: string`).

- [ ] **Step 1: Write `segment-legend.test.ts`:**
  - `legend merges warm-up and cool-down`: for `['warmup','run','walk','cooldown']`, the kinds are
    `['warmup','run','walk']` and the first label is `'Warm Up / Cool Down'`.
  - With only `['cooldown','run']` present, the result is the merged entry, then run.
  - `['run','stopped']` gives no merged entry.
- [ ] **Step 2:** run. Expected: FAIL. Implement `segment-legend.ts`. Run. Expected: PASS.
- [ ] **Step 3: Rebuild `SegmentColors`/`StatColors` from the JSON** in `theme.ts`.
  - Import with `import palette from './brand-palette.json'`.
  - Rewrite the `StatColors` doc comment: the tiles now share the run colour and the chart's
    colours, per ADR 0027's amendment.
- [ ] **Step 4: Point `SegmentLegend` at `segmentLegendEntries`** (swatch colour
  `segmentColors[entry.kind]`).
- [ ] **Step 5: Make the stat tiles neutral where the amendment says.**
  - In both `StatGrid.Tile`s, the label loses `style={{ color }}` and takes `tone="secondary"`.
  - The glyph's `tintColor` is `color ?? colors.textSecondary`.
  - In `RunStatGrid`, drop `color` from Active Time and Distance.
  - In `FreeRunStatGrid`, drop it from Active Time, Moving Time and Distance.
  - Running keeps `stat.running`, the pace tiles `stat.pace`, Elevation Gain `stat.elevation`.
- [ ] **Step 6: Neutral captions with swatches in `RunProfileCard`.** Both unit captions take
  `tone="secondary"` with no colour style. When `withElevation`, each caption is preceded by a
  `h-0.5 w-3 rounded-full` swatch in its series colour, inside a `flex-row items-center gap-1`.
- [ ] **Step 7:** in `run-summary-headline.tsx`, change `'text-primary'` to `'text-foreground'` and
  fix the comment above it ("partial keeps the primary accent" is now wrong).
- [ ] **Step 8:** `bun test`, `bun run typecheck`, `bun run typecheck:android`, `bun run lint`.
  Expected: all PASS.
- [ ] **Step 9: Commit** with `feat: recolour segments and stats around the brand run colour`.

### Task 4: Chart hairlines, route casing and the start marker

**Files:**
- Modify: `src/components/run-profile-chart.tsx` (stop markers)
- Modify: `src/domain/route-render.ts`, `src/domain/route-render.test.ts`
- Modify: `src/hooks/use-run-track.ts` (`useStyledRoute`)
- Modify: `src/components/route-map/adapter.ios.tsx:57`, `src/components/route-map/adapter.android.tsx:91`

**Interfaces:**
- Consumes: `ROUTE_CASING_W` (Task 3).
- Produces: `toRouteLines(chunks, segments, colors, casingColor: string): RouteLine[]`. It returns
  one casing per chunk first (id `case-${i}`, colour `casingColor`, width = the line's width +
  `ROUTE_CASING_W`), then the coloured lines (unchanged ids `seg-${i}`). That way no casing paints
  over a neighbouring line.

- [ ] **Step 1: Extend `route-render.test.ts`.**
  - `cases every line beneath all lines`: 2 chunks give 4 lines. Ids are
    `['case-0','case-1','seg-0','seg-1']`. Casing widths are `ROUTE_STROKE_W_RUN + 3` for a run
    chunk and `ROUTE_STROKE_W + 3` for walk.
  - `unmatched chunk is cased walk`.
  - Update the existing tests for the new parameter.
- [ ] **Step 2:** run. Expected: FAIL. Implement. Run. Expected: PASS.
- [ ] **Step 3: Pass the casing colour in `useStyledRoute`.** It passes `useTheme().background` as
  `casingColor` and adds it to the `useMemo` deps (Review Focus 4). Neither adapter changes its
  polyline mapping: casings arrive as ordinary lines.
- [ ] **Step 4: Make the start marker neutral.** iOS `tintColor: colors.text`; Android
  `dot('start', …, colors.text)`. The finish keeps `colors.success`.
- [ ] **Step 5: Dash the stop hairlines.**
  - Replace the stop `Rect` with Skia's `Line` (import it as `SkiaLine`; victory-native's `Line` is
    already in scope).
  - It runs from `(x, chartBounds.top)` to `(x, chartBounds.bottom)`, where `x` is the centre of
    today's `markerLeft(...)` rect.
  - Style: `strokeWidth={STOP_MARKER_WIDTH}`, `color={segment.stopped}`, with a
    `<DashPathEffect intervals={STOP_DASH} />` child. Add `const STOP_DASH = [3, 3]` beside
    `STOP_MARKER_WIDTH`.
  - This is ADR 0027 §5's "differs in form" for marks under 3 pt.
- [ ] **Step 6:** `bun test`, both typechecks, lint. Expected: all PASS.
- [ ] **Step 7: Commit** with `feat: dash stop markers, case the route and neutralise the start marker`.

### Task 5: Device verification and handoff

- [ ] **Step 1: Make a run with a route.**
  - iOS: start `xcrun simctl location <udid> start --speed=2.8 --interval=1.0 59.3293,18.0686
    59.3353,18.0686` before the run, use a real-plan session, and end it after 2+ minutes.
  - Android: the `adb emu geo fix` stepping recipe (AGENTS.md "Maps"). Also make a free run with a
    20 s stop.
- [ ] **Step 2: Check the summary with argent, in light and dark, on the iOS 26.5 simulator and the
  `emulator-5554` emulator.**
  - The route's casing is visible over the tiles; the start marker is neutral.
  - The chart's stop hairlines are dashed; the strip is run orange with walk gray.
  - The pace line is magenta and the elevation line green.
  - Captions and labels are neutral, with coloured swatches and glyphs.
  - The Running tile is orange; Active Time and Distance are neutral.
  - Repeat on the Android summary scrolled to the very bottom.
- [ ] **Step 3: Check the session sheet:** one "Warm Up / Cool Down" swatch, and the walk gray is
  readable on the element card.
- [ ] **Step 4: Switch the theme while the summary is open** (`xcrun simctl ui <udid> appearance
  dark`, `adb shell cmd uimode night yes`). The casing follows.
- [ ] **Step 5: E2E.** Use `e2e-refresh` to run the targeted flows `complete-session`,
  `run-denied-path` and `free-run`. Their "Warm Up" anchors are on the summary's splits, which keep
  `SEGMENT_KIND_LABEL`. Android runs in CI.
- [ ] **Step 6: Run the `adr-compliance-reviewer` and `comment-density-auditor` agents** and fix
  what they find. Record the unchanged fingerprints in the PR body.
- [ ] **Step 7:** open the PR, titled `feat: brand palette stage 1 — palette sources and run-data
  colours`.
