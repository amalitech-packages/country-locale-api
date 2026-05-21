import { describe, expect, it } from 'vitest';
import { greet, version } from './index.js';

describe('@amali-tech/PACKAGE_NAME', () => {
  it('exports a version string', () => {
    expect(typeof version).toBe('string');
  });

  it('greets by name', () => {
    expect(greet({ name: 'World' })).toBe('Hello, World!');
  });
});
