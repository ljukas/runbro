import { describe, expect, it } from 'bun:test';

import { brandScheme } from '@/constants/brand-scheme';

import { listItemColors } from './list-item-colors';

describe('listItemColors', () => {
  it('defaults follow Material list tokens', () => {
    const colors = listItemColors(brandScheme('light'));
    expect(colors.containerColor).toBe('#FFF8F6');
    expect(colors.contentColor).toBe('#251914');
    expect(colors.supportingContentColor).toBe('#584239');
  });

  it('caller colors win over defaults', () => {
    const colors = listItemColors(brandScheme('light'), { containerColor: 'X' });
    expect(colors).toEqual({
      containerColor: 'X',
      contentColor: '#251914',
      leadingContentColor: '#584239',
      trailingContentColor: '#584239',
      supportingContentColor: '#584239',
      overlineContentColor: '#584239',
    });
  });
});
