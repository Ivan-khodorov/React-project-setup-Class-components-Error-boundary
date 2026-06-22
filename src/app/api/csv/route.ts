import { createSelectedItemsCsv } from '../../../utils/csv';
import type { SelectedItem } from '../../../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSelectedItem = (value: unknown): value is SelectedItem => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.detailsId === 'string' &&
    typeof value.description === 'string' &&
    typeof value.detailsUrl === 'string' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
};

const parseSelectedItems = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) && parsed.every(isSelectedItem) ? parsed : null;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const items = parseSelectedItems(formData.get('items'));

  if (!items || items.length === 0) {
    return Response.json(
      { message: 'At least one valid selected item is required.' },
      { status: 400 }
    );
  }

  const csv = createSelectedItemsCsv(items);

  return new Response(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${items.length}_items.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
