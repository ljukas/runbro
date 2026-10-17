import { Uniwind } from 'uniwind';

import { materialTheme, type Scheme } from '@/constants/material-theme';

/** Generated brand scheme → Uniwind CSS variables (ADR 0027 §4). Both schemes are pushed at launch so a runtime theme flip recolours without a relaunch. */
export function applyPlatformTheme(): void {
  for (const scheme of ['light', 'dark'] as const satisfies readonly Scheme[]) {
    const c = materialTheme(scheme);
    Uniwind.updateCSSVariables(scheme, {
      '--color-primary': c.primary,
      '--color-primary-foreground': c.primaryForeground,
      '--color-primary-fill': c.primaryFill,
      '--color-primary-fill-foreground': c.primaryFillForeground,
      '--color-background': c.background,
      '--color-background-element': c.backgroundElement,
      '--color-background-selected': c.backgroundSelected,
      '--color-background-grouped': c.backgroundGrouped,
      '--color-background-card': c.backgroundCard,
      '--color-foreground': c.text,
      '--color-foreground-secondary': c.textSecondary,
      '--color-destructive': c.destructive,
      '--color-destructive-foreground': c.destructiveForeground,
    });
  }
}
