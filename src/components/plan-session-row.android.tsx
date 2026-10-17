import { Text } from '@expo/ui/jetpack-compose';

import { Island } from '@/components/island';
import { useBrandScheme } from '@/hooks/use-brand-scheme';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

import { formatMinutes } from '@/domain/format';
import { sessionTotalSeconds, type PlanSession } from '@/domain/plan';

export function PlanSessionRow({
  session,
  completed,
  isNext,
  disabled,
  onPress,
}: {
  session: PlanSession;
  completed: boolean;
  isNext: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const m = useBrandScheme();
  const state = completed ? 'Completed' : isNext ? 'Up next' : 'Not started';
  return (
    <Island.ListItem
      modifiers={disabled ? [] : [clickable(onPress)]}
      colors={
        isNext
          ? {
              containerColor: m.secondaryContainer,
              contentColor: m.onSecondaryContainer,
              supportingContentColor: m.onSecondaryContainer,
              trailingContentColor: m.onSecondaryContainer,
            }
          : undefined
      }
    >
      <Island.ListItem.HeadlineContent>
        <Text>{`Day ${session.day}`}</Text>
      </Island.ListItem.HeadlineContent>
      <Island.ListItem.SupportingContent>
        <Text>{state}</Text>
      </Island.ListItem.SupportingContent>
      <Island.ListItem.TrailingContent>
        <Text>{formatMinutes(sessionTotalSeconds(session))}</Text>
      </Island.ListItem.TrailingContent>
    </Island.ListItem>
  );
}
