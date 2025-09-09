/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

// Mock environment variables for testing
import { vi } from 'vitest';

// Mock environment variables
vi.mock('$env/dynamic/public', () => ({
  env: {
    OPENAI_API_KEY: 'test-key',
    GEMINI_API_KEY: 'test-key',
    GEMINI_MODEL: 'test-model',
    ANTHROPIC_API_KEY: 'test-key',
    LUMA_AI_API_KEY: 'test-key',
    PEXELS_API_KEY: 'test-key',
  },
}));

// Mock SvelteKit environment
vi.mock('$env/static/public', () => ({
  PUBLIC_APP_NAME: 'PocketFlow Test',
}));
