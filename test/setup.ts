import { beforeAll } from 'vitest';

declare global {
  var PREFERENCES: DurableObjectNamespace;
}

beforeAll(() => {
  // Miniflare will automatically set up the DO namespace
  // based on the wrangler.toml configuration
}); 