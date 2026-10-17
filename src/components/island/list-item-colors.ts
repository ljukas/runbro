import type { ListItemColors } from '@expo/ui/jetpack-compose';

import type { MaterialRoles } from '@/constants/brand-scheme';

export function listItemColors(roles: MaterialRoles, override?: ListItemColors): ListItemColors {
  return {
    containerColor: roles.surface,
    contentColor: roles.onSurface,
    leadingContentColor: roles.onSurfaceVariant,
    trailingContentColor: roles.onSurfaceVariant,
    supportingContentColor: roles.onSurfaceVariant,
    overlineContentColor: roles.onSurfaceVariant,
    ...override,
  };
}
