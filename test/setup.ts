import { beforeAll, vi } from 'vitest';

declare global {
  var PREFERENCES: DurableObjectNamespace;
}

beforeAll(() => {
  // Miniflare will automatically set up the DO namespace
  // based on the wrangler.toml configuration
}); 

// Mock specific SQL migration file
vi.mock('../../drizzle/0000_wealthy_kinsey_walden.sql', () => {
  return {
    default: 'CREATE TABLE mock_table (id TEXT PRIMARY KEY);'
  }
}) 