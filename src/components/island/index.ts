import { IslandButton } from './button';
import { IslandHost } from './host';
import { IslandIconButton } from './icon-button';
import { IslandLabel } from './label';
import { IslandListItem } from './list-item';
import { IslandText } from './text';
import { IslandView } from './view';

/** The Island seam: one vocabulary over SwiftUI (iOS) and Compose (Android) islands — Host plus .Text, .Label, .Button, .IconButton, .View and .ListItem (ADR 0013, ADR 0025 §2). */
export const Island = Object.assign(IslandHost, {
  Text: IslandText,
  Label: IslandLabel,
  Button: IslandButton,
  IconButton: IslandIconButton,
  ListItem: IslandListItem,
  View: IslandView,
});
