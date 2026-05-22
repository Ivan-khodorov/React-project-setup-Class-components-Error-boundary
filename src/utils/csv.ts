import type { SelectedItem } from '../types';

const CSV_HEADERS = ['id', 'name', 'description', 'detailsUrl'];

const escapeCsvValue = (value: string): string => {
  const escapedValue = value.replaceAll('"', '""');

  if (
    escapedValue.includes(',') ||
    escapedValue.includes('"') ||
    escapedValue.includes('\n')
  ) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
};

export const createSelectedItemsCsv = (items: SelectedItem[]): string => {
  const rows = items.map((item) =>
    [item.id, item.name, item.description, item.detailsUrl]
      .map(escapeCsvValue)
      .join(',')
  );

  return [CSV_HEADERS.join(','), ...rows].join('\n');
};
