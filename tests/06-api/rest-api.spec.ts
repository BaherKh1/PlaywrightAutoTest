import { test, expect, request } from '@playwright/test';
import { API_URL } from '../../utils/constants';
import { buildPost } from '../../utils/data-factory';

/**
 * LESSON 10 — API testing
 * The `request` fixture sends HTTP calls WITHOUT a browser: fast and great for
 * backend checks, preparing test data, or cleaning up after UI tests.
 * Practice API: https://jsonplaceholder.typicode.com (fake, nothing is really saved)
 */
test.use({ baseURL: API_URL, extraHTTPHeaders: { Accept: 'application/json' } });

test.describe('CRUD with the request fixture', () => {
  test('GET a collection', async ({ request }) => {
    const response = await request.get('/posts');

    expect(response).toBeOK(); // status 200-299
    expect(response.headers()['content-type']).toContain('application/json');

    const posts = await response.json();
    expect(posts).toHaveLength(100);
    expect(posts[0]).toEqual(
      expect.objectContaining({ id: 1, userId: 1, title: expect.any(String), body: expect.any(String) }),
    );
  });

  test('GET with query parameters', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 3 } });
    const posts: Array<{ userId: number }> = await response.json();

    expect(posts).toHaveLength(10);
    expect(posts.every((p) => p.userId === 3)).toBe(true);
  });

  test('POST creates a resource', async ({ request }) => {
    const newPost = buildPost();
    const response = await request.post('/posts', { data: newPost });

    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ ...newPost, id: 101 });
  });

  test('PUT replaces and PATCH updates', async ({ request }) => {
    const put = await request.put('/posts/1', { data: { id: 1, title: 'new', body: 'new', userId: 1 } });
    expect(put.status()).toBe(200);
    expect((await put.json()).title).toBe('new');

    const patch = await request.patch('/posts/1', { data: { title: 'patched' } });
    expect(patch.status()).toBe(200);
    expect((await patch.json()).title).toBe('patched');
  });

  test('DELETE removes a resource', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });

  test('a missing resource returns 404', async ({ request }) => {
    const response = await request.get('/posts/99999');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBe(false);
  });
});

test.describe('your own API context (e.g. with auth headers)', () => {
  test('create a context manually and dispose it', async () => {
    const api = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Authorization: 'Bearer demo-token' },
    });
    try {
      const response = await api.get('/users/1');
      expect(response).toBeOK();
      expect((await response.json()).username).toBe('Bret');
    } finally {
      await api.dispose();
    }
  });
});
