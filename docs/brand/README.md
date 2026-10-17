# RunBro brand

The **Dash R** mark: a white italic R with three speed dashes on a sunrise gradient
(amber `#FFB224` → coral `#FF4256`, 135°). Chosen on 2026-10-17 over five other
concepts. It is about running and the RunBro name, not about Couch to 5K, because
the plan is only the first of many the app will carry.

**Status:** the icon, splash and palette are built and ship with the next native release. See the [roadmap](../roadmap/README.md).

![Overview](exports/final-sheet.png)

## Files

| File                                                          | Use                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `source/*.svg`                                                | Masters for every icon export (1024 canvas)                                                                               |
| `exports/play-icon-512.png`                                   | Google Play listing icon (512 × 512, full bleed; Play applies the mask)                                                   |
| `exports/icon.png`                                            | iOS / universal icon (1024, opaque)                                                                                       |
| `exports/android-icon-{foreground,background,monochrome}.png` | Android adaptive icon layers; the foreground stays inside the 66% safe zone, and the monochrome layer is for themed icons |
| `exports/splash-icon.png`                                     | White mark for the splash screen, sized for `app.json`'s 76 dp `imageWidth`, on `#FF7A3D`                                 |
| `exports/feature-graphic-{a,b}.png`                           | Google Play feature graphic candidates (1024 × 500)                                                                       |
| `brand.json`                                                  | Colour tokens, font and mark construction                                                                                 |

The type is **Barlow** (SIL Open Font License, from Google Fonts): 900 italic for
the wordmark, 800 italic for taglines, 600 for body text. It is for marketing art
only; the app keeps the system fonts.

## Palette

The app's colours follow this mark per [ADR 0027](../adr/0027-brand-palette-accent-and-generated-material-scheme.md)
(its 2026-10-17 amendment pins the values). White on `#FF7A3D` is about 2.6:1
(1.8:1 on the amber end, 3.4:1 on the coral end), below the 4.5:1 WCAG AA asks of
body text, so the gradient is decoration only; text and controls use darker shades.

To re-export an icon, render its SVG at the target size, for example with headless
Chrome:
`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1024,1024 --default-background-color=00000000 --screenshot=out.png source/icon.svg`.
