import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';

describe('API resources client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists resources', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: '1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await listResource<{ id: string }>('items');
    expect(result).toEqual([{ id: '1' }]);
  });

  it('creates resources', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1', name: 'Item' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await createResource('items', { name: 'Item' });
    expect(result).toEqual({ id: '1', name: 'Item' });
  });

  it('patches resources', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1', name: 'Updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await patchResource<{ name: string }>('items', '1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('handles deletes with 204', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(deleteResource('items', '1')).resolves.toBeUndefined();
  });

  it('throws parsed API error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Validation failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(listResource('items')).rejects.toThrow('Validation failed');
  });
});

