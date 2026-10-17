import { Platform, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { HEALTH_STORE as STORE } from '@/constants/health-store';

// why a condensed copy: docs/privacy-policy.md is the hosted policy the store listings link to;
// this keeps its substance with this platform's names filled in, so edit both together.
const REVOKE_IN = Platform.select({ android: 'Health Connect', default: 'the Health app' });
const MAPS = Platform.select({ android: 'Google Maps', default: 'Apple Maps' });
const MAPS_COMPANY = Platform.select({ android: 'Google', default: 'Apple' });
const MOTION = Platform.select({ android: 'physical activity', default: 'Motion & Fitness' });
const BACKUP = Platform.select({ android: "Google's backup", default: 'iCloud' });

const SECTIONS: readonly { title: string; body: string }[] = [
  {
    title: 'RunBro does not collect your data',
    body: 'RunBro has no backend, no accounts, no analytics, no advertising and no tracking. The developer never receives your runs, your location or anything else about you, and RunBro does not sell or share your data with anyone.',
  },
  {
    title: 'Where your data lives',
    body: `Your runs — times, distances, recorded GPS routes, step counts and air-pressure readings for elevation — are stored in a database on your phone. They are included in your phone's own backup (${BACKUP}), under your account and its provider's terms; RunBro has no access to that backup. Uninstalling the app, or clearing its data, deletes everything it has stored.`,
  },
  {
    title: 'Location and motion',
    body: `RunBro uses your precise location and ${MOTION} data only while a run is in progress, to measure distance, pace and elevation and to record your route, and only with the permissions you grant. It never requests background location or tracks you outside a run.`,
  },
  {
    title: 'Maps',
    body: `To show a route, the app loads map images from ${MAPS}. Your route line is drawn on your phone and is not sent, but ${MAPS_COMPANY} receives the requests for the area shown, with technical details such as your IP address and device model, and handles them under its own privacy policy.`,
  },
  {
    title: STORE,
    body: `If you allow it, RunBro writes finished runs to ${STORE} as workouts, with their duration, distance, intervals and route. From there, ${STORE} governs the data like any other workout you've saved to it — including syncing it and sharing it with any other app you've separately given access to.\n\nRunBro only ever writes to ${STORE}. It requests no read access and never reads your health data. You can change or turn this off at any time in ${REVOKE_IN}.`,
  },
  {
    title: 'Exports',
    body: "A run's export goes only where you send it through your phone's share sheet.",
  },
  {
    title: 'Your rights and contact',
    body: 'RunBro is made by Lukas Lindqvist in Sweden. Because the developer holds no data about you, everything is on your phone and in your control. For questions or requests, email runbro@lukaslindqvist.se. You can also complain to a data-protection authority — in Sweden, IMY (imy.se).',
  },
];

export function PrivacyPolicy() {
  return (
    <View className="gap-6">
      <Text variant="footnote" tone="secondary">
        Last updated 14 October 2026
      </Text>
      {SECTIONS.map((section) => (
        <View key={section.title} className="gap-2">
          <Text variant="title2" className="font-semibold" accessibilityRole="header">
            {section.title}
          </Text>
          <Text tone="secondary">{section.body}</Text>
        </View>
      ))}
    </View>
  );
}
