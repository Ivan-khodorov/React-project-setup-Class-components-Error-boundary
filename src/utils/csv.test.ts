import { describe, expect, it } from 'vitest';
import { createSelectedItemsCsv } from './csv';
import type { SelectedItem } from '../types';

const spock: SelectedItem = {
  description: 'Science officer',
  detailsUrl: '/?details=spock',
  id: 'spock',
  name: 'Spock',
};

describe('createSelectedItemsCsv', () => {
  it('creates a csv header and row', () => {
    expect(createSelectedItemsCsv([spock])).toBe(
      'id,name,description,detailsUrl\nspock,Spock,Science officer,/?details=spock'
    );
  });

  it('creates multiple rows', () => {
    const kirk: SelectedItem = {
      description: 'Captain',
      detailsUrl: '/?details=kirk',
      id: 'kirk',
      name: 'Kirk',
    };

    expect(createSelectedItemsCsv([spock, kirk])).toBe(
      'id,name,description,detailsUrl\nspock,Spock,Science officer,/?details=spock\nkirk,Kirk,Captain,/?details=kirk'
    );
  });

  it('escapes csv values with quotes, commas, and line breaks', () => {
    const item: SelectedItem = {
      description: 'Line one\nLine "two"',
      detailsUrl: '/?details=number-one',
      id: 'number-one',
      name: 'Number One, Una',
    };

    expect(createSelectedItemsCsv([item])).toBe(
      'id,name,description,detailsUrl\nnumber-one,"Number One, Una","Line one\nLine ""two""",/?details=number-one'
    );
  });
});
