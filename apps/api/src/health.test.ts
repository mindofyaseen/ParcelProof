import { describe, expect, it } from 'vitest';
import { handler } from './health.js';

describe('health handler', () => {
  it('returns an explicit healthy response', async () => {
    const response = await handler({} as never, {} as never, () => undefined);

    expect(typeof response).toBe('object');
    if (!response || typeof response !== 'object') {
      throw new Error('Expected an API Gateway object response');
    }
    expect(response).toMatchObject({ statusCode: 200 });
    expect(JSON.parse(response.body ?? '{}')).toMatchObject({
      status: 'ok',
      service: 'parcelproof-api'
    });
  });
});
