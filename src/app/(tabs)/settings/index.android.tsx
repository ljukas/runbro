import { Box, LazyColumn, Text } from '@expo/ui/jetpack-compose';
import { background, clickable, fillMaxSize, padding } from '@expo/ui/jetpack-compose/modifiers';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { FieldTestRow } from '@/components/field-test-row';
import { Island } from '@/components/island';
import { ListSectionHeader } from '@/components/list-section-header';
import { SettingsToggle } from '@/components/settings-toggle';
import { useTheme } from '@/hooks/use-theme';
import { isFieldTestBuild } from '@/services/field-test';
import {
  openHealthApp,
  openHealthStore,
  requestWriteAccess,
  useHealthAuthorization,
  type HealthAuthorization,
} from '@/services/health';
import {
  locationTracker,
  useLocationPermission,
  type LocationPermissionStatus,
} from '@/services/location-tracker';
import { resetAndRestart } from '@/services/onboarding-store';

const LOCATION_ACCESS: Record<LocationPermissionStatus, string> = {
  granted: 'While using the app',
  denied: 'Denied in Settings',
  undetermined: 'Not enabled',
  unsupported: 'Not available',
};

const HEALTH_ACCESS: Record<HealthAuthorization, string> = {
  authorized: 'Saving workouts',
  denied: 'Off',
  notDetermined: 'Not set up',
  unavailable: 'Not available',
  updateRequired: 'Update needed',
};

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const location = useLocationPermission();
  const health = useHealthAuthorization();

  return (
    <Island>
      <LazyColumn
        modifiers={[fillMaxSize(), background(colors.background)]}
        contentPadding={{ bottom: 24 }}
      >
        <ListSectionHeader title="Coaching" />
        <SettingsToggle
          label="Interval cues"
          description="Interval cues call out each walk/run switch."
          settingKey="intervalCuesEnabled"
        />
        <SettingsToggle
          label="Milestone cues"
          description="Milestone cues add motivational spots — halfway, your last run, each kilometre of a free run, and finishing. A gentle vibration accompanies each cue while the screen is on."
          settingKey="milestoneCuesEnabled"
        />

        {/* No toggle: only the system can grant this, so the row reports and defers to app Settings. */}
        <ListSectionHeader title="Location" />
        <Island.ListItem>
          <Island.ListItem.HeadlineContent>
            <Text>Access</Text>
          </Island.ListItem.HeadlineContent>
          <Island.ListItem.SupportingContent>
            <Text>
              {location === 'granted'
                ? 'Location measures your distance and route, and keeps tracking while the screen is off.'
                : "Without location, runs are still timed correctly — but distance and pace aren't recorded."}
            </Text>
          </Island.ListItem.SupportingContent>
          <Island.ListItem.TrailingContent>
            <Text>{location ? LOCATION_ACCESS[location] : '—'}</Text>
          </Island.ListItem.TrailingContent>
        </Island.ListItem>
        {location === 'denied' ? (
          <Island.ListItem modifiers={[clickable(() => void Linking.openSettings())]}>
            <Island.ListItem.HeadlineContent>
              <Text color={colors.primary}>Open Settings</Text>
            </Island.ListItem.HeadlineContent>
          </Island.ListItem>
        ) : null}
        {location === 'undetermined' ? (
          <Island.ListItem modifiers={[clickable(() => void locationTracker.requestPermission())]}>
            <Island.ListItem.HeadlineContent>
              <Text color={colors.primary}>Enable location</Text>
            </Island.ListItem.HeadlineContent>
          </Island.ListItem>
        ) : null}

        {/* No switch: Health Connect's revokeAllPermissions() only takes effect after an app
            restart, and Google's guidance sends users to Health Connect instead (ADR 0011). */}
        <ListSectionHeader title="Health Connect" />
        <Island.ListItem>
          <Island.ListItem.HeadlineContent>
            <Text>Access</Text>
          </Island.ListItem.HeadlineContent>
          <Island.ListItem.SupportingContent>
            <Text>
              {health === 'authorized'
                ? 'Finished runs are saved to Health Connect, with a route if location is on. Older runs can be saved one at a time from their summary.'
                : health === 'unavailable'
                  ? "Health Connect isn't available on this device."
                  : health === 'updateRequired'
                    ? 'Saving runs to Health Connect needs the Health Connect app, or an update to it.'
                    : 'Save your finished runs to Health Connect, with distance and route. Nothing is ever read from Health Connect.'}
            </Text>
          </Island.ListItem.SupportingContent>
          <Island.ListItem.TrailingContent>
            <Text>{HEALTH_ACCESS[health]}</Text>
          </Island.ListItem.TrailingContent>
        </Island.ListItem>
        {health === 'notDetermined' ? (
          <Island.ListItem modifiers={[clickable(() => void requestWriteAccess())]}>
            <Island.ListItem.HeadlineContent>
              <Text color={colors.primary}>Set up Health Connect</Text>
            </Island.ListItem.HeadlineContent>
          </Island.ListItem>
        ) : null}
        {health === 'updateRequired' ? (
          <Island.ListItem modifiers={[clickable(() => void openHealthStore())]}>
            <Island.ListItem.HeadlineContent>
              <Text color={colors.primary}>Get Health Connect</Text>
            </Island.ListItem.HeadlineContent>
          </Island.ListItem>
        ) : null}
        {health === 'denied' ? (
          <Island.ListItem modifiers={[clickable(() => void openHealthApp())]}>
            <Island.ListItem.HeadlineContent>
              <Text color={colors.primary}>Open Health Connect</Text>
            </Island.ListItem.HeadlineContent>
          </Island.ListItem>
        ) : null}
        <Island.ListItem modifiers={[clickable(() => router.navigate('/privacy'))]}>
          <Island.ListItem.HeadlineContent>
            <Text color={colors.primary}>Privacy policy</Text>
          </Island.ListItem.HeadlineContent>
        </Island.ListItem>

        <ListSectionHeader title="About" />
        <Island.ListItem>
          <Island.ListItem.HeadlineContent>
            <Text>Version</Text>
          </Island.ListItem.HeadlineContent>
          <Island.ListItem.SupportingContent>
            <Text>No account, no sign-in. Your runs stay on this device.</Text>
          </Island.ListItem.SupportingContent>
          <Island.ListItem.TrailingContent>
            <Text>{Constants.expoConfig?.version ?? '—'}</Text>
          </Island.ListItem.TrailingContent>
        </Island.ListItem>

        {__DEV__ ? (
          <>
            <ListSectionHeader title="Developer" />
            <SettingsToggle label="Compressed plan" settingKey="useCompressedPlan" />
            <Island.ListItem modifiers={[clickable(() => resetAndRestart(router))]}>
              <Island.ListItem.HeadlineContent>
                <Text>Reset onboarding</Text>
              </Island.ListItem.HeadlineContent>
            </Island.ListItem>
          </>
        ) : null}

        {isFieldTestBuild() ? (
          <>
            <ListSectionHeader title="Field test" />
            <Island.ListItem>
              <Island.ListItem.SupportingContent>
                <Text>
                  Starts an untracked capture for the barometer field tests
                  (docs/field-test-capture-protocol.md). No cues, no plan progress, no Health
                  Connect write.
                </Text>
              </Island.ListItem.SupportingContent>
            </Island.ListItem>
            {/* The only bare button in this list; ListItem rows inset themselves. */}
            <Box modifiers={[padding(16, 8, 16, 0)]}>
              <FieldTestRow />
            </Box>
          </>
        ) : null}
      </LazyColumn>
    </Island>
  );
}
