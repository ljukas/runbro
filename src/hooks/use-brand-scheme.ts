import { useColorScheme } from 'react-native';

import { brandScheme, type MaterialRoles } from '@/constants/brand-scheme';

export function useBrandScheme(): MaterialRoles {
  return brandScheme(useColorScheme() === 'dark' ? 'dark' : 'light');
}
