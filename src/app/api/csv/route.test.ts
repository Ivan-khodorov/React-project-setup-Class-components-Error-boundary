import { describe, expect, it } from 'vitest';
import { POST } from './route';

const createRequest = (items: string) => {
  const formData = new FormData();
  formData.set('items', items);

  return new Request('http://localhost/api/csv', {
    body: formData,
    method: 'POST',
  });
};

describe('POST /api/csv', () => {
  it('returns a downloadable server-generated csv', async () => {
    const response = await POST(
      createRequest(
        JSON.stringify([
          {
            detailsId: 'spock',
            description: 'Science officer',
            detailsUrl: '/en?page=1&details=spock',
            id: 'spock',
            name: 'Spock',
          },
        ])
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'text/csv; charset=utf-8'
    );
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="1_items.csv"'
    );
    await expect(response.text()).resolves.toBe(
      'id,name,description,detailsUrl\nspock,Spock,Science officer,/en?page=1&details=spock'
    );
  });

  it('rejects invalid selected item data', async () => {
    const response = await POST(createRequest('{"id":"spock"}'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'At least one valid selected item is required.',
    });
  });
});
