import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { useBrandScheme } from '@/hooks/use-brand-scheme';

export default function TabsLayout() {
  const roles = useBrandScheme();
  // why: iconColor/tintColor aren't Android-gated in expo-router's types, and iOS keeps its asset-catalog accent.
  const androidTabColors =
    Platform.OS === 'android'
      ? {
          backgroundColor: roles.surfaceContainer,
          indicatorColor: roles.secondaryContainer,
          iconColor: { default: roles.onSurfaceVariant, selected: roles.onSecondaryContainer },
          labelStyle: {
            default: { color: roles.onSurfaceVariant },
            selected: { color: roles.onSurface },
          },
          rippleColor: `${roles.onSurface}1A`,
          tintColor: roles.onSecondaryContainer,
        }
      : {};

  return (
    <NativeTabs {...androidTabColors}>
      <NativeTabs.Trigger name="(index)">
        <NativeTabs.Trigger.Label>Run</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.run" md="directions_run" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.closed.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
