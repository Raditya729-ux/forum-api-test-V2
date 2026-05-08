import { describe, it, expect } from 'vitest';

describe('CI fail scenario', () => {
  it('should fail intentionally', () => {
    expect(true).toBe(false);
  });
});
