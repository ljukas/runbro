# Brand palette — stage 2: the iOS accent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** iOS takes the brand as its accent: an asset-catalog `AccentColor` for everything that
follows the system tint, and named colours for the app's explicit tints, so increased contrast works
where SwiftUI can reach.

**Architecture:** An owned config plugin requires `plugins/brand-accent.json` (stage 1). It writes
three colour sets (`AccentColor`, `PrimaryFill`, `PrimaryFillForeground`), each with four variants,
and sets the global accent build setting. JS reads the same file for the hex tokens, which Uniwind
text and native-stack headers need. A `useAccentColors()` hook hands iOS components
`PlatformColor` names and Android hex. Native stage: both fingerprints move.

**Tech Stack:** `expo/config-plugins` (`withDangerousMod`, `withXcodeProject`, `IOSConfig.Paths`),
`PlatformColor`, `@expo/ui` SwiftUI modifiers, expo-router's navigation theme.

**Spec:** [ADR 0027](../../adr/0027-brand-palette-accent-and-generated-material-scheme.md) §1, §2,
§3, the 2026-10-17 amendment (`PrimaryFillForeground`, `primary` off `background-element`).

**Stages:** [1](2026-10-17-brand-palette-stage-1-sources-and-data-marks.md) → **2 (this)** →
[3](2026-10-17-brand-palette-stage-3-android-scheme.md) →
[4](2026-10-17-brand-palette-stage-4-brand-art.md). Stacked on stage 1's PR.

## Global Constraints

- **The plugin's input:** it `require()`s `plugins/brand-accent.json`, and nothing else defines an
  accent hex. That `require` is deliberate: it makes the file a fingerprint source (ADR 0027 §3).
- **Colour-set names:** exactly `AccentColor`, `PrimaryFill` and `PrimaryFillForeground`. JSON key
  → set: `primary` → `AccentColor`, `primaryFill` → `PrimaryFill`, `primaryFillForeground` →
  `PrimaryFillForeground`. `primaryForeground` stays hex-only.
- **Build setting:** `ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor`, on the **app
  target's** configurations only. A future extension target (ADR 0022) brings its own colour.
- **Source root:** resolved per variant with `IOSConfig.Paths.getSourceRoot(projectRoot)`. Never
  hard-code `RunBro`, because `APP_VARIANT` changes the project name.
- **Left alone:** toggles stay system green, alerts system-styled, `success`/`destructive` system
  colours. No `headerTintColor`, which would tint the title too.
- **Rebuild:** a native `app.json` field or plugin change does nothing until
  `bun run prebuild:dev` (or `--clean`) re-runs (AGENTS.md "Prebuild gotcha").
- **Xcode 27.1 local builds** need `EXPO_USE_PRECOMPILED_MODULES=0` and the stale
  `ExpoModulesJSI.xcframework` deleted (memory note `xcode-27-1-local-ios-build`).

## Review Focus

1. **Increased-contrast dark:** the primary button's fill turns pale (`#FFB598`). Its label must
   turn black, not stay SwiftUI's default white. → Task 3 step plus a simulator check (Task 5).
2. **The iOS 17.5 runtime** has no Liquid Glass, so `Island.Button` falls back to
   `borderedProminent`. That path also needs the named fill and label. → Task 5 runs on `ios 17`.
3. **Prebuild runs twice** (`expo run:ios` after `prebuild:dev`) must leave one build setting and
   identical colour sets, not duplicates. → Task 1 test `is idempotent` plus a `git diff`-style
   check of two prebuilds.
4. **The `e2e` and production variants** have different project names, and the colour sets must
   land in each one's `Images.xcassets`. → Task 1 step: run `APP_VARIANT=e2e` prebuild.
5. **Android in this stage:** `useAccentColors()` on Android must return the current hex tokens.
   An Android screen sharing a component (`feature-row`, onboarding bodies) mustn't receive an iOS
   colour name. → Task 3 test-by-typecheck plus an emulator glance.

---

### Task 1: The config plugin

**Files:**
- Create: `plugins/brand-color-sets.js` (pure: no requires), `plugins/brand-color-sets.test.ts`
- Create: `plugins/with-brand-colors.js`
- Modify: `app.json` (`plugins`: add `"./plugins/with-brand-colors"` after `./plugins/with-health`)

**Interfaces:**
- Consumes: `plugins/brand-accent.json` (stage 1). Each key is `{ light, dark, lightHighContrast,
  darkHighContrast }`.
- Produces: `colorSetContents(variants) => object`, the `Contents.json` body for one colour set.
  It has four `colors` entries:
  - `universal` with no appearances (light);
  - `luminosity: dark`;
  - `contrast: high`;
  - `luminosity: dark` + `contrast: high`.

  Each entry is `color-space: srgb`, with components as `0xRR` strings and alpha `"1.000"`, plus
  `info: { author: 'xcode', version: 1 }`.
- Produces: `COLOR_SETS = { AccentColor: 'primary', PrimaryFill: 'primaryFill',
  PrimaryFillForeground: 'primaryFillForeground' }`.

- [ ] **Step 1: Write `brand-color-sets.test.ts`:**
  - `writes four appearance variants`: for `primary`, the dark + high-contrast entry has red `0xFF`,
    green `0xB5`, blue `0x98`.
  - `is idempotent`: two calls deep-equal.
  - `names exactly three sets`.
- [ ] **Step 2:** run. Expected: FAIL. Implement `brand-color-sets.js` (CommonJS, so the plugin can
  require it). Run. Expected: PASS.
- [ ] **Step 3: Write `with-brand-colors.js`** in `with-health.js`'s style (`createRunOncePlugin`,
  named functions):
  - `withDangerousMod(['ios', …])` writes
    `<sourceRoot>/Images.xcassets/<Name>.colorset/Contents.json` for each set;
  - `withXcodeProject` sets the build setting on every `XCBuildConfiguration` of the application
    target. Find it by its product type, not by name.
- [ ] **Step 4: Prebuild and inspect.** Run `bun run prebuild:dev -- --clean`, then:
  - `cat ios/*/Images.xcassets/AccentColor.colorset/Contents.json` shows four variants;
  - `grep -c ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME ios/*.xcodeproj/project.pbxproj`
    equals the app target's configuration count.
  - Run `bun run prebuild:dev` again; the count is unchanged.
  - Repeat with `APP_VARIANT=e2e bunx expo prebuild -p ios --clean`.
- [ ] **Step 5:** record the iOS and Android fingerprints (both move; the plugin list is in
  `expoConfig`). Commit with `feat(ios): brand accent colour sets via an owned config plugin`.

### Task 2: The accent tokens

**Files:**
- Modify: `src/constants/theme.ts` (`Colors`; delete `PRIMARY`)
- Modify: `src/global.css` (both `@variant` blocks; new `--color-primary-fill-foreground`)
- Modify: `src/constants/material-theme.android.ts` (`primaryFillForeground: m.onPrimary` until
  stage 3 rewrites the file)

**Interfaces:**
- Produces: `Colors.{light,dark}`:
  - `primary`, `primaryForeground`, `primaryFill` and the new `primaryFillForeground`, from
    `brand-accent.json`'s `light`/`dark` columns (imported as `../../plugins/brand-accent.json`);
  - `ThemeColor` gains `primaryFillForeground`.

- [ ] **Step 1:** update `theme.ts` and `global.css` together. The light values are `#BC4A0C`,
  `#FFFFFF`, `#BC4A0C`, `#FFFFFF`; dark `#FF7A3D`, `#000000`, `#C75115`, `#FFFFFF`.
- [ ] **Step 2:** `bun test` (stage 1's `global.css tokens equal Colors` now checks the new token
  both ways), both typechecks, lint. Expected: PASS.
- [ ] **Step 3: Commit** with `feat: brand accent tokens from the accent file`.

### Task 3: Named-colour tints

**Files:**
- Create: `src/hooks/use-accent-colors.ts` (iOS), `src/hooks/use-accent-colors.android.ts`
- Modify: `src/components/island/button.ios.tsx`, `src/components/island/label.ios.tsx:33`
- Modify: `src/components/run-mode-card.ios.tsx:89,107`, `src/components/plan-session-row.ios.tsx:52`
- Modify: `src/components/feature-row.tsx:49`
- Modify the onboarding bodies: `src/app/onboarding/index.tsx:21`, `audio-cues.tsx:25`,
  `location-primer.tsx:42`, `health.tsx:34`

**Interfaces:**
- Produces: `useAccentColors(): { tint: ColorValue; fill: ColorValue; onFill: ColorValue }`.
  - iOS: module-level `PlatformColor('AccentColor')`, `PlatformColor('PrimaryFill')` and
    `PlatformColor('PrimaryFillForeground')`, with stable identity.
  - Android: `useTheme()`'s `primary`, `primaryFill` and `primaryFillForeground`.

- [ ] **Step 1: Write the hook pair.** Every listed call site swaps `colors.primary` for `tint`
  (`run-mode-card.ios.tsx:89` keeps its `featured ? … : colors.textSecondary` shape). Remove
  `useTheme()` from a file only if nothing else in it uses it.
- [ ] **Step 2: Wire the primary `Island.Button`.**
  - `tint(fill)`, and the label is always a child `Text` carrying `foregroundStyle(onFill)` (Review
    Focus 1). The non-`fill` branch, which uses the `label` prop today, takes the child form too.
  - Keep `font`/`frame`/`padding` on the `fill` branch only.
- [ ] **Step 3:** both typechecks and lint. Expected: PASS. `bunx expo export --platform ios` and
  `--platform android`. Expected: both bundles build.
- [ ] **Step 4: Commit** with `feat(ios): explicit tints read the named accent colours`.

### Task 4: Headers follow the accent

**Files:**
- Modify: `src/lib/navigation-theme.ts`

**Interfaces:**
- Produces: `navigationTheme(scheme)` returns `{ ...base, colors: { ...base.colors, primary:
  Colors[light|dark].primary } }`. It stays hex, because React Navigation calls `Color()` on it
  (ADR 0027 §2).

- [ ] **Step 1:** implement it, then `bun run typecheck`. Expected: PASS.
- [ ] **Step 2: Commit** with `feat(ios): native-stack headers take the accent`.

### Task 5: Simulator verification and handoff

Run each check in four states: `xcrun simctl ui <udid> appearance light|dark` ×
`increase_contrast enabled|disabled`. Use argent screenshots, with taps taken from `describe`.

- [ ] **Step 1: Check on iOS 26.5.**
  - The selected tab, and SwiftUI `List` buttons in Settings, follow the accent.
  - The primary CTA (glass) shows the fill and its label: black label in HC dark.
  - The secondary/destructive `bordered` buttons follow the accent.
  - The Run tab's progress bar and featured glyph, the plan's up-next arrow and the onboarding
    symbols follow it too (reset onboarding from Settings in the dev build).
  - A pushed screen's back button and the `Stack.Toolbar` buttons in `_layout.tsx:111,135` follow
    the hex accent. Headers have no HC variant (accepted gap).
  - Toggles stay green, and `Alert.alert` stays system.
- [ ] **Step 2: On the `ios 17` simulator** (iOS 17.5), check the `borderedProminent` CTA in all
  four states. Use argent; Maestro can't drive 17.5 (AGENTS.md "Maps").
- [ ] **Step 3: On the Android emulator,** take one light/dark pass of onboarding and the Run tab.
  It is unchanged except where stage 1 changed it (Review Focus 5).
- [ ] **Step 4: If `Stack.Toolbar` buttons or any `@expo/ui` tint ignore the named colour,** add
  the measured behaviour to ADR 0027 as a dated amendment. Don't work around it silently.
- [ ] **Step 5: Run the targeted flows with `e2e-refresh`.** The first refresh after a plugin
  change is a full rebuild. Run the `onboarding` tag and `complete-session`.
- [ ] **Step 6: Run the reviewers,** `adr-compliance-reviewer` and `comment-density-auditor`, plus
  a native-review pass on the plugin against Expo's config-plugin docs (Context7). Put the
  fingerprint table (stage 1 → stage 2, both platforms, the `development`/`e2e`/unset variants) in
  the PR body.
- [ ] **Step 7:** open the PR, titled `feat(ios): brand palette stage 2 — the iOS accent`.
