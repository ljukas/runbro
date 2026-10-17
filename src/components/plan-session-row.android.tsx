import { ListItem, Text } from '@expo/ui/jetpack-compose';
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
    <ListItem
      modifiers={disabled ? [] : [clickable(onPress)]}
      colors={
        isNext
          ? { containerColor: m.secondaryContainer, contentColor: m.onSecondaryContainer }
          : undefined
      }
    >
      <ListItem.HeadlineContent>
        <Text>{`Day ${session.day}`}</Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Text>{state}</Text>
      </ListItem.SupportingContent>
      <ListItem.TrailingContent>
        <Text>{formatMinutes(sessionTotalSeconds(session))}</Text>
      </ListItem.TrailingContent>
    </ListItem>
  );
}
