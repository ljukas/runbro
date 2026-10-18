import { ListItem, type ListItemProps } from '@expo/ui/jetpack-compose';

import { useBrandScheme } from '@/hooks/use-brand-scheme';

import { listItemColors } from './list-item-colors';

// why explicit roles: Compose's defaults come from the Host's TonalSpot seed scheme, not the brand scheme (ADR 0027 §4).
function ListItemRoot({ colors, ...props }: ListItemProps) {
  const roles = useBrandScheme();
  return <ListItem colors={listItemColors(roles, colors)} {...props} />;
}

export const IslandListItem = Object.assign(ListItemRoot, {
  HeadlineContent: ListItem.HeadlineContent,
  OverlineContent: ListItem.OverlineContent,
  SupportingContent: ListItem.SupportingContent,
  LeadingContent: ListItem.LeadingContent,
  TrailingContent: ListItem.TrailingContent,
});
