# Brand palette — stage 3: the Android brand scheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Android drops wallpaper colour. Every RN token, Compose control and the tab bar take the
generated `SchemeContent` roles from stage 1's palette, so the app looks like its icon.

**Architecture:** `brandScheme(scheme)` reads `brand-palette.json`'s `scheme` roles, which have the
same role names as `@expo/ui`'s `MaterialColors`. It replaces both wallpaper readers:
`getMaterialColors` behind `materialTheme()` and `useMaterialColors()` inside Compose trees. Compose
controls take explicit `colors` once, in `island/` wrappers and the Android domain components.
`IslandHost` seeds the rest (ripples, focus, dialog internals) with the brand as TonalSpot. A lint
rule keeps the wallpaper readers out. Native only through `app.json` `primaryColor`.

**Tech Stack:** `@expo/ui/jetpack-compose` (`colors` props, `Host seedColor`), expo-router
`NativeTabs` Android props, ESLint `no-restricted-imports`.

**Spec:** [ADR 0027](../../adr/0027-brand-palette-accent-and-generated-material-scheme.md) §3, §4 and
§5's tertiary rule; the reversed [ADR 0025](../../adr/0025-android-staged-migration.md) §4.

**Stages:** [1](2026-10-17-brand-palette-stage-1-sources-and-data-marks.md) →
[2](2026-10-17-brand-palette-stage-2-ios-accent.md) → **3 (this)** →
[4](2026-10-17-brand-palette-stage-4-brand-art.md). Stacked on stage 2's PR.

## Global Constraints

- **Roles:** come only from `brand-palette.json`. After this stage nothing calls
  `getMaterialColors` or `useMaterialColors`, and lint enforces it.
- **The seed:** `IslandHost` passes `seedColor={palette.seed}` (`#FF7A3D`). It's TonalSpot, so its
  defaults differ from Content. That is ADR 0027's accepted gap until the upstream prop exists.
- **No wallpaper setting** and no Android system-contrast support (ADR 0027 §4, accepted).
- **Tertiary roles stay off data surfaces.** The Run-tab chooser card may keep
  `tertiaryContainer`.
- **`primaryColor`** is a top-level `app.json` key. It moves both fingerprints (`expoConfig`),
  which is accepted inside this release. Look up its exact name and effect for SDK 57 with Context7
  (`/expo/expo`) before adding it.
- **Route forks:** an `.android.tsx` route file is bundled and evaluated on iOS (AGENTS.md
  "Platform forks"). Anything it newly imports must resolve on iOS, hence the
  `island/list-item.ios.tsx` stub.
- **Bottom inset:** re-check Settings and Log scrolled to the very bottom on the emulator. A
  `ListItem` swap mustn't lose the content container's `androidOnly('pb-safe-offset-N')`.

## Review Focus

1. **Disabled controls** (a disabled `Island.Button`, the Run-tab Start before the resume gate
   clears) keep TonalSpot's disabled defaults. They must still read as disabled next to the brand
   fill. → Task 5 emulator check, both schemes.
2. **Theme switching at runtime:** `useBrandScheme()` follows `useColorScheme()`, and
   `applyPlatformTheme()` pushes both schemes at launch. Flipping `adb shell cmd uimode night yes`
   with Settings open must recolour lists and switches without a relaunch. → Task 5 step.
3. **The location foreground-service notification** takes `materialTheme('light').primary`. It is
   now `#A53C00`, readable on the light notification shade. → Task 5 step, screen-off run.
4. **`plan-session-row`'s next-up override:** it sets `colors` only when `isNext`. The wrapper's
   defaults must merge under the override, not replace it, or the next row loses its container.
   → Task 3 test `caller colors win over defaults`.
5. **Android 9–11 devices** (no dynamic colour) used to take the baseline Material palette and now
   take the same brand scheme. Nothing may branch on `isDynamicColorAvailable` any more. → the
   Task 2 grep step.

---

### Task 1: The generated scheme replaces the wallpaper

**Files:**
- Create: `src/constants/brand-scheme.ts`, `src/hooks/use-brand-scheme.ts`
- Modify: `src/constants/material-theme.android.ts` (rewrite)
- Create: `src/constants/material-theme.test.ts` (imports `./material-theme.android` by its full
  name; an `.android.test.ts` name would land in the iOS tsconfig project unexcluded)

**Interfaces:**
- Consumes: `brand-palette.json` (`scheme`, `seed`).
- Produces:
  - `type MaterialRoles = (typeof palette.scheme)['light']`, with a compile-time `satisfies
    Record<keyof MaterialColors, string>` (type-only import);
  - `brandScheme(scheme: 'light' | 'dark'): MaterialRoles`;
  - `BRAND_SEED: string`;
  - `useBrandScheme(): MaterialRoles` (platform-neutral, unsuffixed);
  - `materialTheme(scheme)`, same signature. It keeps today's role → token mapping and adds
    `primaryFillForeground: onPrimary`. It drops the cache and `getMaterialColors`.

- [ ] **Step 1: Write `material-theme.test.ts`:**
  - `materialTheme maps the generated roles`: light `primary` `#A53C00`, `background` `#FFF8F6`,
    `backgroundCard` `#F5DED6`, `backgroundElement` `#FBE3DB`, `textSecondary` `#584239`;
  - dark `primary` `#FFB598` and `backgroundCard` `#40322C`;
  - `success` still equals `Colors[scheme].success`.
- [ ] **Step 2:** run. Expected: FAIL (the wallpaper version imports `@expo/ui`, which Bun can't
  load). Implement. Run. Expected: PASS.
- [ ] **Step 3: Rewrite the doc comments that said "wallpaper"** in `material-theme.android.ts`,
  `platform-theme.android.ts` and `navigation-theme.android.ts`. Name ADR 0027 §4; ADR 0025 §4 is
  reversed.
- [ ] **Step 4:** `bun run typecheck:android`. Expected: PASS. Commit with
  `feat(android): the generated brand scheme replaces wallpaper colour`.

### Task 2: Compose readers and the lint ban

**Files:**
- Modify: `onboarding-button.android.tsx:49,115`, `onboarding-carousel.android.tsx:55`,
  `onboarding-hero.android.tsx:33`, `permission-step-screen.android.tsx:74`,
  `plan-session-row.android.tsx:21`, `run-mode-card.android.tsx:75` (all in `src/components/`)
- Modify: `eslint.config.js` (the existing `**/*.android.{ts,tsx}` block)

- [ ] **Step 1:** swap each `useMaterialColors()` for `useBrandScheme()`. The role names are
  identical, so no other line changes. Fix `plan-session-row.android.tsx:20`'s "wallpaper-derived"
  comment.
- [ ] **Step 2: Add the lint ban** to the same `no-restricted-imports` entry, beside `patterns`:
  `paths: [{ name: '@expo/ui/jetpack-compose', importNames: ['getMaterialColors',
  'useMaterialColors'], message: 'Brand scheme only (ADR 0027 §4): use brandScheme() /
  useBrandScheme().' }]`. A second block with the same `files` would replace this rule, not add to
  it.
- [ ] **Step 3:** `bun run lint`. Expected: PASS. Then
  `grep -rn "getMaterialColors\|useMaterialColors\|isDynamicColorAvailable" src`. Expected: no
  matches.
- [ ] **Step 4: Commit** with `refactor(android): Compose trees read the brand scheme; ban wallpaper reads`.

### Task 3: Explicit colours on Compose controls

**Files:**
- Create: `src/components/island/list-item.android.tsx`, `src/components/island/list-item.ios.tsx`
  (stub)
- Create: `src/components/island/list-item-colors.ts`, `src/components/island/list-item-colors.test.ts`
- Modify: `src/components/island/index.ts` (add `ListItem`), `island/host.android.tsx`,
  `island/button.android.tsx`
- Modify: `src/components/settings-toggle.android.tsx`, `src/components/run-transport.android.tsx`,
  `src/components/plan-session-row.android.tsx`
- Modify: `src/app/(tabs)/settings/index.android.tsx` (every direct `ListItem`), `src/app/(tabs)/log/index.android.tsx:60`

**Interfaces:**
- Produces `listItemColors(roles: MaterialRoles, override?: ListItemColors): ListItemColors`, as
  `{ ...defaults, ...override }` with these defaults (Material 3 list tokens):
  - `containerColor: surface`, `contentColor: onSurface`;
  - `leadingContentColor`, `trailingContentColor`, `supportingContentColor` and
    `overlineContentColor`: `onSurfaceVariant`.
- Produces `Island.ListItem`, which takes `ListItemProps` and `HeadlineContent`/`OverlineContent`/
  `SupportingContent`/`LeadingContent`/`TrailingContent` statics re-exported from `ListItem`. The
  iOS stub returns `null` and carries the same statics (the "Never rendered" comment, as in
  `list-section-header.ios.tsx`).
- The pinned control colours:
  - `Island.Button` primary: `{ containerColor: primary, contentColor: onPrimary }`; secondary
    (`OutlinedButton`): `{ contentColor: primary }` (no border key exists, an accepted gap);
    destructive unchanged.
  - `Switch` (Material 3 switch tokens): `checkedThumbColor: onPrimary`, `checkedTrackColor:
    primary`, `checkedBorderColor: primary`, `checkedIconColor: onPrimaryContainer`,
    `uncheckedThumbColor: outline`, `uncheckedTrackColor: surfaceContainerHighest`,
    `uncheckedBorderColor: outline`, `uncheckedIconColor: surfaceContainerHighest`. Disabled keys
    unset.
  - `AlertDialog`: `containerColor: surfaceContainerHigh`, `iconContentColor: secondary`,
    `titleContentColor: onSurface`, `textContentColor: onSurfaceVariant`. Its non-destructive
    `TextButton`s: `{ contentColor: primary }`.
  - `IslandHost`: `seedColor={BRAND_SEED}` before `{...props}`, so a caller can still override it.

- [ ] **Step 1: Write `list-item-colors.test.ts`:**
  - `defaults follow Material list tokens`: light `containerColor` `#FFF8F6`, `contentColor`
    `#251914`, `supportingContentColor` `#584239`;
  - `caller colors win over defaults`: override `{ containerColor: 'X' }` keeps the other five
    defaults.
- [ ] **Step 2:** run. Expected: FAIL. Implement `list-item-colors.ts`. Run. Expected: PASS.
- [ ] **Step 3: Add the wrapper** and replace every bare `ListItem` (Settings, Log,
  `settings-toggle`, `plan-session-row`) with `Island.ListItem`. `plan-session-row` passes its
  `isNext` override as `colors`.
- [ ] **Step 4: Apply the pinned colours** to `Island.Button`, `Switch` and `AlertDialog`/
  `TextButton`. Set `IslandHost`'s seed and replace its comment with one line naming ADR 0027 §4.
- [ ] **Step 5: Check both bundles.** Run both typechecks and lint, then `bunx expo export
  --platform ios` and `--platform android`. Expected: PASS, and the iOS bundle resolves
  `island/list-item`.
- [ ] **Step 6: Commit** with `feat(android): brand colours on Compose controls via island wrappers`.

### Task 4: Tab bar and window theme

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`
- Modify: `app.json` (`primaryColor`)

**Interfaces:**
- Produces: on Android only, `NativeTabs` receives the Material 3 navigation-bar tokens from
  `useBrandScheme()`:
  - `backgroundColor: surfaceContainer`, `indicatorColor: secondaryContainer`;
  - `iconColor: { default: onSurfaceVariant, selected: onSecondaryContainer }`;
  - `labelStyle: { default: { color: onSurfaceVariant }, selected: { color: onSurface } }`;
  - `rippleColor`: `onSurface` + `1A` alpha;
  - `tintColor: onSecondaryContainer`.

  They're spread from `Platform.OS === 'android' ? {...} : {}`, so iOS keeps the asset accent:
  `iconColor` and `tintColor` aren't platform-gated in expo-router's types.

- [ ] **Step 1:** implement the props. Confirm `primaryColor`'s key and effect in the SDK 57 docs,
  then set it to `"#A53C00"`.
- [ ] **Step 2:** run `bun run prebuild:dev:android`, then `cd android && APP_VARIANT=development
  ./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a`, and install with
  `adb -s emulator-5554 install -r` (AGENTS.md storage recipe).
- [ ] **Step 3:** record the fingerprints (both move). Commit with
  `feat(android): brand tab bar and window primary colour`.

### Task 5: Emulator verification, docs and the upstream request

- [ ] **Step 1: Check on `emulator-5554`, light and dark, with argent `describe` for taps.**
  - Onboarding: reset it from Settings and step through the carousel (dots, hero shapes, the
    advance button's pill, permission rows).
  - The Run tab: the featured card on `primaryContainer` `#FF7A3D`, the free-run card's olive hero,
    and the progress bar.
  - The week list's next-up row; Settings toggles and link rows; the Log list.
  - The run screen's end-run dialog.
  - The tab bar: indicator and colours, no lavender.
  - The summary, scrolled to the bottom.
  - Large font (`adb shell settings put system font_scale 2.0`) on Settings.
- [ ] **Step 2: Test the runtime switch** (Review Focus 2) and a screen-off run's notification
  (Review Focus 3, `KEYCODE_SLEEP`).
- [ ] **Step 3: Update `AGENTS.md`.**
  - In "What this app is", replace "dynamic (wallpaper) colour" with the brand scheme.
  - Rewrite "Theming (Android)" around `brandScheme()`, `useBrandScheme()`, the lint ban and the
    seed.
  - Add a line to ADR 0025's stage table notes pointing at ADR 0027.
- [ ] **Step 4: Draft the Expo feature request.** `Host` / `getMaterialColors` should accept a
  full `ColorScheme` or a scheme variant (`SchemeContent`), to close the TonalSpot gap. Put the
  text in the PR body; **the owner files it** (it goes to a public tracker).
- [ ] **Step 5:** the `e2e-android` CI lane runs; locally, run the onboarding flows on Android per
  AGENTS.md "Android (ADR 0025 stage 7)". Run the reviewers.
- [ ] **Step 6:** open the PR, titled `feat(android): brand palette stage 3 — the generated Material scheme`.
