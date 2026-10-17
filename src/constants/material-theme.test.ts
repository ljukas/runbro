import { describe, expect, test } from 'bun:test';

import { materialTheme } from './material-theme.android';
import { Colors } from './theme';

describe('materialTheme maps the generated roles', () => {
  test('light', () => {
    const t = materialTheme('light');
    expect(t.primary).toBe('#A53C00');
    expect(t.background).toBe('#FFF8F6');
    expect(t.backgroundCard).toBe('#F5DED6');
    expect(t.backgroundElement).toBe('#FBE3DB');
    expect(t.textSecondary).toBe('#584239');
  });

  test('dark', () => {
    const t = materialTheme('dark');
    expect(t.primary).toBe('#FFB598');
    expect(t.backgroundCard).toBe('#40322C');
  });

  test('success keeps the shared value', () => {
    expect(materialTheme('light').success).toBe(Colors.light.success);
    expect(materialTheme('dark').success).toBe(Colors.dark.success);
  });
});
