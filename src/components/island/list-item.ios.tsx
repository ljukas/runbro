import type { ReactNode } from 'react';

const Slot = (_props: { children: ReactNode }) => null;

// Never rendered: expo-router bundles every platform's route files into both bundles, so a module
// an Android route imports must still resolve on iOS (ADR 0025).
function ListItemRoot(_props: { colors?: object; modifiers?: unknown[]; children?: ReactNode }) {
  return null;
}

export const IslandListItem = Object.assign(ListItemRoot, {
  HeadlineContent: Slot,
  OverlineContent: Slot,
  SupportingContent: Slot,
  LeadingContent: Slot,
  TrailingContent: Slot,
});
