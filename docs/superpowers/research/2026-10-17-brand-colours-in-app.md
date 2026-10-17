# Brand colours in the app — research

Date: 2026-10-17
Status: **research / Researched** — not a decision to build.

**Outcome (2026-10-17):** the owner chose differently from this doc's Recommendation:

- **Android:** a brand Material scheme generated at build time, with no wallpaper setting.
- **iOS:** the accent in the asset catalog, not per-surface `tintColor`/`seedColor`. Spike 1 below showed the accent reaches the tab bar and the SwiftUI islands.

[ADR 0027](../../adr/0027-brand-palette-accent-and-generated-material-scheme.md) is the decision. Where it disagrees with this doc, the ADR wins.

**Question:** How should the app's own palette adopt the Dash R sunrise (amber
`#FFB224` → coral `#FF4256`, mid `#FF7A3D`; [brand assets](../../brand/README.md))
on iOS and Android, so the app matches its new icon, without failing contrast,
breaking the run/walk segment colours, or quietly undoing ADR 0025's choice of
wallpaper colour on Android?

## TL;DR

- **Feasibility:** `Feasible` — a theme-token change plus per-surface tints, with
  no new native module. iOS needs no new dependency, since `@expo/ui`'s SwiftUI
  `Host` already takes a `seedColor` that it applies as the tint. One caveat sits
  on Android: `@expo/ui` seeds Compose islands only with Material's
  `SchemeTonalSpot`, which turns the brand into a muted brown (`#8E4D30`).
- **Local-first fit:** `Fully local` — only colours change. No data, network or
  permission is involved.
- **Recommended approach:** **Option A on iOS** (brand as the accent: one
  accessible burnt orange in light mode, the real `#FF7A3D` in dark, with system
  neutrals everywhere else), **combined with Option C on Android** (a brand palette
  by default, with "use wallpaper colours" as a setting). Option C reopens
  ADR 0025. The segment colours get a new mapping in the same change. This is an
  assessment, not a commitment.

## Context

The brand landed in [PR #98](../../brand/README.md). The app still shows Expo's
template icon and splash, plus a blue palette (`primary #3c87f7`,
`primaryFill #0071e3`) that has nothing to do with the mark. The store screenshots
are blocked until the app's colours match the icon. The icon, the splash and this
palette are meant to ship in one native build (see the
[roadmap](../../roadmap/README.md)). The brand README's
[open questions](../../brand/README.md#open-questions-for-the-palette) are this
doc's brief: where the brand shows, Android, segment colours, contrast, dark mode.

ADRs and subsystems in scope:

- [ADR 0002](../../adr/0002-uniwind-styling-engine.md) — the theme tokens live in
  `src/global.css` (`@variant light/dark`), with a JS mirror in
  `src/constants/theme.ts` (`Colors`). Both files change.
- [ADR 0013](../../adr/0013-component-design-conventions.md) — paired
  `-foreground` tokens. Any new brand token comes with its own foreground.
- [ADR 0005](../../adr/0005-system-native-ui-expo-ui.md) — the SwiftUI and Compose
  islands. They take colour from `Host`, not from Uniwind.
- [ADR 0025](../../adr/0025-android-staged-migration.md) §4 — "Android colour is
  dynamic", and it explicitly rejected a **"Static Material palette seeded from the
  brand colour … by product decision"**. When that was decided there was no brand
  beyond system blue. Any brand-seeded Android option reopens this decision, as
  flagged below.
- `SegmentColors`, `StatColors` and `useSegmentColors()` (segment bar, legend,
  splits, pace chart, phase header, route track). These are Apple system colours
  today, and warm-up is already orange.

Inherited constraints: no backend, accounts or analytics. iOS-first, Android in
stages. Official tooling preferred. The icon and splash are native changes, so the
release goes through a store build anyway (ADR 0012). The palette itself is JS-only
unless an iOS asset-catalog accent is added (see Findings).

## Findings

### Platform guidance

- **Apple asks for restraint with brand colour.** The HIG Branding page was revised
  on 2026-09-09: "Apply your app's accent color judiciously. Using your brand color
  too broadly can overwhelm your interface", "use it intentionally for primary
  actions or status indicators, like badges … or an icon for the selected tab", and
  "consider moving it into the content layer, where it scrolls beneath Liquid Glass
  controls" ([Branding](https://developer.apple.com/design/human-interface-guidelines/branding),
  verified 2026-10-17).
- **Apple: one meaning per colour, and colour on prominent backgrounds rather than
  on glyphs.** "Avoid using the same color to mean different things." The system
  "applies the app accent color to the background in prominent buttons". Supply
  "light and dark variants, and an increased contrast option for each". "Avoid
  redefining the semantic meanings of dynamic system colors." For "apps with
  primarily monochromatic content or backgrounds, choosing your brand color as the
  app accent color can be an effective way to tailor your app experience"
  ([Color](https://developer.apple.com/design/human-interface-guidelines/color),
  last changed 2025-12-16, verified 2026-10-17).
- **Material treats dynamic colour as optional, and brand colours as a supported
  case.** "If your app has custom or brand colors that you don't want to change
  with the user's preferences, you can add them individually." Harmonization shifts
  them to sit with user colours
  ([Android dynamic colors](https://developer.android.com/develop/ui/views/theming/dynamic-colors);
  second source: [MDC-Android Color.md](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md),
  "If you need different brand colors … define custom colors"; both verified
  2026-10-17). The Compose guide treats a brand-derived custom `ColorScheme` as the
  normal fallback
  ([Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3),
  verified 2026-10-17).

### What our stack exposes

- **iOS has no app-wide accent setting in Expo.** Apple's global accent is an
  asset-catalog colour set named by `ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME`
  ([Xcode docs](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme)).
  The SDK 57 app config has no key for it
  ([app config](https://docs.expo.dev/versions/v57.0.0/config/app/)), and
  `@expo/config-plugins`, `@expo/prebuild-config` and `expo-build-properties` don't
  mention it. The prebuilt `ios/RunBro/Images.xcassets` has no `AccentColor` set
  (all verified 2026-10-17). Getting one would take an owned config plugin, which is
  a fingerprint source. Whether it would reach the RN-hosted chrome is
  **unverified**.
- **Per-surface tinting is available and covers what we render:**
  - `NativeTabs` `tintColor` and `iconColor {default, selected}` (both platforms;
    local `expo-router@57.0.23` types,
    [docs](https://docs.expo.dev/versions/latest/sdk/router/native-tabs)). The tab
    bar sets none today, so the selected tab is system blue.
  - Native Stack `headerTintColor`.
  - The SwiftUI `Host`'s **`seedColor`**: "applied to the SwiftUI content as its
    tint … propagates through the SwiftUI environment" (`HostView.swift` does
    `content.tint(seedColor)`;
    [docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/swift-ui/host/), added in
    `@expo/ui` 57.0.0).
  - Per-view `tint()` and `foregroundStyle()` modifiers, the latter of which accepts
    a `linearGradient`. Verified 2026-10-17.
- **Android: `@expo/ui` 57.0.20 seeds only with TonalSpot.** `Host` and
  `getMaterialColors` take a `seedColor`, but `MaterialColors.kt` hard-codes
  `SchemeTonalSpot(Hct.fromInt(seed), isDark, 0.0)`. No prop takes a full
  `ColorScheme` or another scheme variant. Individual components do take `colors`
  (Button, Switch, Slider, NavigationBar, Card, Chip and others). Verified against
  the installed Kotlin source and the
  [Host docs](https://docs.expo.dev/versions/v57.0.0/sdk/ui/jetpack-compose/host/),
  2026-10-17.
- **Today's Android wiring** (`src/constants/material-theme.android.ts`,
  `src/lib/platform-theme.android.ts`): `getMaterialColors({ scheme })` fills the
  tokens, and `applyPlatformTheme()` pushes them into Uniwind's CSS variables at
  launch. `IslandHost` deliberately passes no seed (`island/host.android.tsx`).
  Swapping to a brand palette means changing three files, all behind existing
  seams.
- **Where `primary` reaches today:** 17 files. These are the onboarding hero icons,
  `Island.Button` (`primaryFill`), the `run-mode-card` progress, feature rows,
  section headers, the route-map start marker, and the Android carousel/buttons.
  Plus `text-primary` ×4 and `bg-primary` ×1. The change is small, and the
  overreach the HIG warns about can be avoided.

### Scheme maths (computed 2026-10-17 with Google's `@material/material-color-utilities` 0.4.0, Apache-2.0, pure TS, published 2026-01-21)

The seed `#FF7A3D` is HCT hue 40.9, chroma 64.5, tone 66.1.

| Variant | Light primary | Dark primary | primaryContainer (light / dark) | Reads as |
|---|---|---|---|---|
| TonalSpot (what `@expo/ui` uses) | `#8E4D30` | `#FFB598` | `#FFDBCD` / `#71361B` | muted brown-coral |
| Fidelity / Content | `#A53C00` | `#FFB598` | **`#FF7A3D`** (the seed itself) | burnt orange; the brand survives |
| Vibrant | `#A53C00` | `#FFB598` | `#FFDBCD` / `#7E2C00` | orange, paler containers |

All have `onPrimary` ≥ 6.4:1. Only Fidelity and Content keep the seed faithfully.
The library's own comments say so, and
[Flutter's `DynamicSchemeVariant`](https://api.flutter.dev/flutter/material/DynamicSchemeVariant.html)
cross-checks it ("palettes match seed color, even if … very bright"). The package
has no reported Hermes problems, but it hasn't been tried under Metro or Hermes.
It ships ESM only (**unverified on device**).

### Contrast (WCAG 2.2: [SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) 4.5:1 text, [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) 3:1 for UI and graphics; computed 2026-10-17)

| Colour | vs white | vs `#F2F2F7` (grouped) | vs `#1C1C1E` (dark card) | vs black |
|---|---|---|---|---|
| amber `#FFB224` | 1.80 | 1.62 | 9.44 | 11.65 |
| mid `#FF7A3D` | 2.59 | 2.32 | **6.57** | 8.10 |
| coral `#FF4256` | 3.41 | 3.05 | 5.00 | 6.17 |
| today's `primary #3c87f7` (for scale) | 3.50 | 3.14 | 4.86 | 6.00 |

- **Light mode needs a darker brand shade; dark mode can use the real one.** On the
  mid hue (HCT 40.9/64.5), these are the lightest tones that pass:
  - `#C75115`: white text on it at 4.5:1 (filled button).
  - `#BC4A0C`: 4.5:1 as text on the grouped gray.
  - `#E3662A`: 3:1 non-text on gray (segment bars, chart lines).

  In dark mode `#FF7A3D` passes as text on the dark card (6.57:1). White text on
  it fails (2.59:1), but black text on it gives 8.1:1.
- **Apple's iOS 26 system orange moved** to `#FF8D28` (light) and `#FF9230`
  (dark). Its increased-contrast variant is `#C55300` (4.55:1 on white),
  practically the same shade as the burnt orange we need. Today's
  `SegmentColors.warmup` (`#FF9500`) is the pre-26 value
  ([HIG Color table](https://developer.apple.com/design/human-interface-guidelines/color),
  "June 9, 2025 Updated system color values"; one source, verified 2026-10-17).

### Collisions inside the app's own palette

- **Warm-up is orange.** `SegmentColors.warmup` `#FF9500` would read as brand. The
  HIG's "same colour, different meaning" rule says to remap it.
- **`StatColors.running` is system red `#FF3B30`.** That is close to the coral end
  and will look like a slightly-off brand colour next to it.
- **Run is system blue `#007AFF`.** This works against an orange accent, but it
  means the most important phase is the one colour that isn't the brand.
- **Harmonizing the system colours toward the brand** (`Blend.harmonize`, at most a
  15° hue shift) moves blue to `#5E70FF` and green to `#77C12C`. That is a modest
  gain, and Apple says not to redefine system colours, so it's an Android-only tool
  if used at all.

## Spike results (2026-10-17)

Two spikes settled the doc's unverified items. They ran on a throwaway branch
(not kept; the diff is archived outside the repo). Devices: the iPhone 18 Pro
simulator on iOS 27.0 (Xcode 27.1) and the Pixel 10 Pro emulator on API 37, using
the dev client.

### Spike 1 — an iOS asset-catalog accent through an owned config plugin

A roughly 50-line config plugin wrote `Images.xcassets/AccentColor.colorset`. It
held four variants: light `#BC4A0C`, dark `#FF7A3D`, high-contrast light `#A53C00`
and high-contrast dark `#FFB598`. The plugin also set
`ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME` on the app target. App code
was unchanged.

| Surface | Explicit tint in code? | Result |
|---|---|---|
| `NativeTabs`, the selected tab | none | **accent** (UIKit tab bar) |
| SwiftUI `List` buttons ("Enable Location", "Set Up Apple Health") | none | **accent** |
| A SwiftUI bordered button ("Not Now", onboarding) | none | **accent** |
| SwiftUI `Toggle` | none | **system green**: a `Toggle` doesn't follow the accent by default |
| `Island.Button`, onboarding hero icons, the plan "up next" arrow | `colors.primary` / `primaryFill` | still blue: an explicit tint wins, so these move with the tokens, not the asset |
| `Alert.alert` (the app's own `UIAlertController`) | none | a neutral Liquid Glass "OK"; the accent doesn't show on a single default action |
| Light ↔ dark, Increased Contrast | none | the variants switch live, with no relaunch |

**Conclusion:** the asset-catalog accent reaches both UIKit chrome and SwiftUI
islands. So iOS needs **one config plugin, plus the token change for the
surfaces we tint explicitly**. It does not need per-surface `tintColor` /
`seedColor` wiring. The plugin is native config, so it moves the iOS fingerprint;
it ships in the same build as the icon and splash. Header buttons weren't tested:
the plan screen hides its back button, and nothing else pushes a header that the
spike could reach without permissions.

### Spike 2 — `@material/material-color-utilities` 0.4.0 under Metro and Hermes

- **Native fingerprint:** unchanged on both platforms after `bun add`. The iOS hash
  `6acd867b…` and the Android hash `e5ac7efd…` were the same before and after, so
  the package is fingerprint-neutral (JS-only).
- **Bundling:** `expo export --platform android` bundled the ESM-only package
  and compiled it to Hermes bytecode without errors. **Size: +216 KB of bytecode**
  (6.68 MB → 6.90 MB).
- **Runtime:** `SchemeFidelity` ran on Hermes in the dev client (light **13.2 ms**,
  dark **8.3 ms**, dev bundle). Its output matched the offline calculation:
  - light: primary `#A53C00`, surface `#FFF8F6`;
  - dark: primary `#FFB598`, surface `#1C110C`.
- **What the user sees**, with the Fidelity tokens pushed through
  `applyPlatformTheme` and `IslandHost seedColor="#FF7A3D"`:
  - **Light mode shows the mismatch.** The RN section headers and links use the
    Fidelity `#A53C00`, a burnt orange. The Compose `Switch`es and the plan card's
    `Button` use the TonalSpot `#8E4D30`, a brown, and the TonalSpot tertiary turns
    the free-run icon tile a dull olive.
  - **Dark mode looks consistent**, because both variants produce the same dark
    primary (`#FFB598`).
  - The **tab bar's indicator stays lavender** in both modes. Neither scheme
    reaches `NativeTabs` on Android; it needs its own `indicatorColor` /
    `tintColor` props.
- **The brand seed is a constant, so the scheme needn't be computed at runtime.**
  A generator script (a dev dependency run with Bun)
  can write the Fidelity roles into `theme.ts` / `global.css` as hex values. That
  avoids the 216 KB and the startup work. The package would only need to ship if a
  "use wallpaper colours" option has to harmonize the brand with a live wallpaper
  palette.
- **The Compose side has two levels.** Our Android files import 9 Compose control
  types (`ListItem` ×4, `Button` ×2, `TextButton` ×2, `Switch`, `OutlinedButton`,
  `FilledTonalButton`, `LinearProgressIndicator`, `Card`, `AlertDialog`). Explicit
  `colors` can bring these in line. But anything left at its default (ripples,
  dialogs, focus and selection colours) still reads the Host's TonalSpot theme.
  Being fully faithful needs a Host that accepts a whole scheme. That is a feature
  request to Expo, and until it lands, explicit colours on the controls we use are
  the workable route.

### Environment finding (unrelated to colour)

**Local iOS builds broke on this Mac with Xcode 27.1 (Swift 6.4)**, and the cause
is two separate problems:

1. **The precompiled module was built with an older Swift.** Expo SDK 57's
   precompiled `ExpoModulesCore` was built with Swift 6.3.1, which Swift 6.4
   refuses to load ("this SDK is not supported by the compiler").
   `expo-build-properties` turns precompiled modules on by default, and the Podfile
   honours `EXPO_USE_PRECOMPILED_MODULES=0` from the environment.
2. **A stale `ExpoModulesJSI` slice was reused.** Its build script reused a slice
   from before the Xcode update, because the cache key ignores the SDK
   ([expo/expo#50365](https://github.com/expo/expo/issues/50365); it was closed as an incomplete repro against an SDK 58 preview, so it is weak support. Deleting the slice is what fixed it). That gives
   `cannot find type '__ObjC::expo'`.

The fix is to delete
`node_modules/expo-modules-jsi/apple/Products/ExpoModulesJSI.xcframework` and
build with `EXPO_USE_PRECOMPILED_MODULES=0`; the build then succeeded.
`expo-modules-jsi` 57.1.2 is out (we have 57.1.1), and
[#51146](https://github.com/expo/expo/issues/51146), a Swift 6.4 issue, is closed.
Whether CI's Xcode is affected wasn't checked.

## Options

### Option A — Brand as the accent only; Android stays on wallpaper colour

- **iOS:**
  - `primary` becomes the brand: light `#C75115` (filled, white text) and
    `#BC4A0C` (tint and text); dark `#FF7A3D`, with black text on fills.
  - `NativeTabs tintColor`, the SwiftUI `Host seedColor` (inside `IslandHost`), and
    the route start marker follow it.
  - Neutrals, success and destructive stay system colours.
  - The bright sunrise gradient appears only as decoration in the content layer
    (onboarding hero, the finish moment), never on Liquid Glass chrome. That is
    exactly where the HIG puts brand colour.
- **Android:** ADR 0025 stands. The brand appears only through the icon, the splash
  and the shared segment colours.
- **Trade-offs:**
  - Smallest change, and it touches no ADR.
  - But the two platforms look like two different apps in the Play screenshots.
    That is the very thing that started this work (the Play listing is the
    *Android* storefront).

### Option B — Brand palette on both platforms; Android seeded from the brand, wallpaper dropped

- **iOS:** as in A.
- **Android:**
  - Compute a **Fidelity** scheme from `#FF7A3D` in JS with
    `@material/material-color-utilities`, and push it through `applyPlatformTheme`.
  - For Compose islands, either:
    - accept `IslandHost seedColor` (TonalSpot, so Compose controls come out
      brownish beside orange RN surfaces);
    - pass `colors` per component (Button and Switch first); or
    - ask Expo for a `variant`/`colorScheme` prop on `Host` (an upstream feature
      request, not a patch, per the owned-module preference).
- **Trade-offs:**
  - Consistent brand.
  - **Reverses ADR 0025 §4** and its "rejected by product decision" line.
  - Adds a JS dependency, which needs a Hermes/Metro check but is fingerprint-free.
  - Leaves a two-scheme mismatch on Android until `@expo/ui` exposes a variant.

### Option C — Brand by default on Android, wallpaper colours as a setting

- Same as B, plus a Settings toggle "Use wallpaper colours", shown only when
  `isDynamicColorAvailable`. It is stored in the kv-store, read synchronously by
  `applyPlatformTheme()`, and re-applied at runtime through
  `Uniwind.updateCSSVariables` and `IslandHost`'s seed prop.
- **Trade-offs:**
  - Keeps the Material You behaviour ADR 0025 chose, as an opt-in, so the ADR is
    amended rather than reversed.
  - The default store screenshots show the brand.
  - Costs one setting and one more state to verify, since both palettes need a pass
    on the emulator.

**Applies to every option — a new segment-colour mapping.** One candidate for the
ADR to test against CVD simulation and the 3:1 non-text bar:

- **run** = brand (light `#E3662A` or darker, dark `#FF7A3D`), keeping the thicker
  stroke so hue is never the only cue.
- **walk** = system gray.
- **warm-up and cool-down** = one cool hue (teal or indigo), told apart by position
  and label.
- **stopped** = a muted neutral, not brown, since brown sits next to a burnt-orange
  primary.
- `StatColors.running` moves off system red.

**Rejected direction:** using the bright gradient stops as interactive colours on
light backgrounds. None of the three passes 4.5:1 on white, and amber fails even
3:1. The gradient is decoration only.

## Comparison

| | A — accent only, Android wallpaper | B — brand on both, wallpaper dropped | C — brand default, wallpaper as a setting |
|---|---|---|---|
| Feasibility | Feasible | Feasible-with-caveats (Compose TonalSpot mismatch; new JS lib on Hermes) | Feasible-with-caveats (as B, plus a runtime re-theme path) |
| Local-first | Fully local | Fully local | Fully local (kv-store setting) |
| Battery / power | None | None | None |
| Platform reach | iOS brand only | Both | Both, user choice kept |
| Cost | Free | Free | Free |
| Maintenance / tooling | Lowest; no ADR change | Reverses ADR 0025 §4; a lib + per-component colours | Amends ADR 0025 §4; two palettes to verify |
| Fixes the Play screenshots | No | Yes | Yes |

## Feasibility assessment

**Feasible.** Every option is a token change behind seams that already exist:

- `global.css` and `theme.ts` (ADR 0002).
- `material-theme.android.ts` and `platform-theme.android.ts` (ADR 0025).
- `IslandHost` on both platforms (ADR 0005).
- One `tintColor` on `NativeTabs`.

None needs a native module. The palette stays OTA-eligible unless an iOS
asset-catalog accent is added, which would need a config plugin and moves the
fingerprint. That is acceptable here because the icon and splash force a native
build anyway. The real caveat is on Android: `@expo/ui` 57.0.20 only seeds
TonalSpot, so the brand reaches Compose islands faithfully only through
per-component `colors` or a future upstream variant prop.
`@material/material-color-utilities` is Google's own pure-TS package. It needs a
Metro/Hermes smoke test before it's relied on.

## Local-first assessment

**Fully local.** Colours are static constants plus, in Option C, one on-device
setting. There is no network, account, analytics or new permission. The
wallpaper palette in C is read on-device through `getMaterialColors`, as it is
today.

## Recommendation

- **iOS: Option A.**
  - One burnt-orange accent in light mode, the real `#FF7A3D` in dark, plus an
    increased-contrast variant, set through `NativeTabs tintColor`, `IslandHost
    seedColor` and the tokens.
  - The sunrise gradient appears only in the content layer.
  - This follows the HIG's 2026-09 brand guidance almost word for word.
- **Android: Option C.**
  - A Fidelity brand scheme by default, so the Play listing and the icon agree.
  - Wallpaper colours stay as a setting, keeping what ADR 0025 valued.
  - Compose controls get explicit `colors` where TonalSpot visibly drifts, and we
    file an upstream request for a scheme-variant prop on `Host`.
- **Both: the new segment mapping above** ships in the same change, since it is
  the part users notice most on the run screen.

> This is an assessment, not a decision to build. A build commitment belongs in
> an ADR, which here would also amend ADR 0025 §4 and ADR 0002's token set.

## Open questions / next steps

- **ADR:**
  - The exact light and dark tokens: one brand token, or `primary` re-pointed, with
    `primary-fill` / `primary-foreground` pairs per ADR 0013.
  - The increased-contrast variants: `DynamicColorIOS` vs Uniwind tokens.
  - Whether the iOS asset-catalog accent (config plugin) is worth it over per-surface
    tints.
  - The amendment wording for ADR 0025 §4.
- **Spikes:** both done; see [Spike results](#spike-results-2026-10-17). What is
  still open:
  - header buttons on a pushed screen;
  - whether the `Toggle` should take the accent or stay system green (the HIG
    allows either);
  - generating the scheme at build time vs runtime;
  - the upstream `Host` scheme request.
- **Segment colours:** validate the candidate mapping under deuteranopia and
  protanopia simulation and at 3:1 non-text on both card backgrounds. Re-check the
  pace and elevation chart lines (ADR 0024).
- **Option C UX:** live re-theme vs next launch (the current palette is cached per
  launch), and where the toggle sits in Settings.
- **Upstream:** a feature request to Expo for `Host`/`getMaterialColors` to take a
  scheme variant (Fidelity/Content), or a full `ColorScheme`.
- **Plan:** ship with the icon and splash in one native build. Store screenshots
  follow; see `docs/brand/README.md`.
