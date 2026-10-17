import { Host, type HostProps } from '@expo/ui/jetpack-compose';

import { BRAND_SEED } from '@/constants/brand-scheme';

// why: Compose's own theme must start from the brand seed (ADR 0027 §4).
export function IslandHost({ style, matchContents, ...props }: HostProps) {
  return (
    <Host
      matchContents={matchContents}
      style={style ?? (matchContents ? undefined : { flex: 1 })}
      seedColor={BRAND_SEED}
      {...props}
    />
  );
}
