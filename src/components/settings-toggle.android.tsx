import { Switch, Text } from '@expo/ui/jetpack-compose';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

import { Island } from '@/components/island';
import { useBrandScheme } from '@/hooks/use-brand-scheme';
import type { SettingsValues } from '@/services/settings';
import { settingsStore, useSetting } from '@/services/settings-store';

/**
 * A Material list row bound to a boolean setting: it owns the store read/write
 * so screens pass only a key. The whole row toggles, not just the switch.
 */
export function SettingsToggle({
  label,
  description,
  settingKey,
}: {
  label: string;
  description?: string;
  settingKey: keyof SettingsValues;
}) {
  const m = useBrandScheme();
  const value = useSetting(settingKey);
  const toggle = () => settingsStore.set(settingKey, !value);
  return (
    <Island.ListItem modifiers={[clickable(toggle)]}>
      <Island.ListItem.HeadlineContent>
        <Text>{label}</Text>
      </Island.ListItem.HeadlineContent>
      {description ? (
        <Island.ListItem.SupportingContent>
          <Text>{description}</Text>
        </Island.ListItem.SupportingContent>
      ) : null}
      <Island.ListItem.TrailingContent>
        <Switch
          value={value}
          onCheckedChange={(next) => settingsStore.set(settingKey, next)}
          colors={{
            checkedThumbColor: m.onPrimary,
            checkedTrackColor: m.primary,
            checkedBorderColor: m.primary,
            checkedIconColor: m.onPrimaryContainer,
            uncheckedThumbColor: m.outline,
            uncheckedTrackColor: m.surfaceContainerHighest,
            uncheckedBorderColor: m.outline,
            uncheckedIconColor: m.surfaceContainerHighest,
          }}
        />
      </Island.ListItem.TrailingContent>
    </Island.ListItem>
  );
}
