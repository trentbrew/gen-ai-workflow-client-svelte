import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
  it('should render the main container', async () => {
    render(Page);

    // Check for the main container div
    const container = page.locator('.h-full.w-full');
    await expect.element(container).toBeInTheDocument();
  });
});
