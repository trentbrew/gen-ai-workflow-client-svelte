<script lang="ts">
  import '../app.css';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { page } from '$app/stores';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import { Ellipsis } from '@lucide/svelte';
  import {
    WORKFLOW_CATEGORIES,
    getWorkflowMetadata,
  } from '$lib/workflow-registry.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children } = $props();

  // Build breadcrumb segments from the current URL
  const toTitle = (s: string) =>
    decodeURIComponent(s)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const segments = $derived.by(() =>
    $page.url.pathname.split('/').filter(Boolean),
  );

  // Also support query-based navigation like /?workflow=rag-system
  const search = $derived.by(() => $page.url.search ?? '');
  const workflow = $derived.by(
    () => new URLSearchParams(search).get('workflow') || '',
  );

  const crumbs = $derived.by(() => {
    // Prefer query-based workflow breadcrumb when present
    if (workflow) {
      const workflowMetadata = getWorkflowMetadata(workflow);
      if (workflowMetadata) {
        const categoryLabel = WORKFLOW_CATEGORIES[workflowMetadata.category];
        return [
          {
            label: categoryLabel,
            href: `/?workflow=${workflow}`,
            isLast: false,
          },
          {
            label: workflowMetadata.title,
            href: `/?workflow=${workflow}`,
            isLast: true,
          },
        ];
      } else {
        // Fallback for unknown workflows
        return [
          {
            label: toTitle(workflow),
            href: `/?workflow=${workflow}`,
            isLast: true,
          },
        ];
      }
    }
    // Fallback to path-based segments
    return segments.map((seg, idx) => ({
      label: toTitle(seg),
      href: '/' + segments.slice(0, idx + 1).join('/'),
      isLast: idx === segments.length - 1,
    }));
  });
</script>

<ModeWatcher defaultMode="dark" />
<div class="flex h-screen">
  <!-- Main Sidebar and Content -->
  <Sidebar.Provider class="flex-1">
    <AppSidebar />
    <Sidebar.Inset>
      <header
        class="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 backdrop-blur z-99 bg-card flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b sticky top-0"
      >
        <div class="flex items-center gap-2 px-4">
          <Sidebar.Trigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              {#if crumbs.length === 0}
                <!-- Root path: show Home as current page -->
                <Breadcrumb.Item>
                  <Breadcrumb.Page>Home</Breadcrumb.Page>
                </Breadcrumb.Item>
              {:else}
                {#each crumbs as crumb, i}
                  {#if !crumb.isLast}
                    <Breadcrumb.Item>
                      <Breadcrumb.Link href={crumb.href}
                        >{crumb.label}</Breadcrumb.Link
                      >
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                  {:else}
                    <Breadcrumb.Item>
                      <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                    </Breadcrumb.Item>
                  {/if}
                {/each}
              {/if}
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
        <div class="ml-auto px-8">
          <Ellipsis size="16" />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-0">
        <div
          class="bg-muted/0 p-0 min-h-[100vh] flex-1 rounded-xl md:min-h-min"
        >
          {@render children()}
        </div>
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
</div>

<!-- Toast notifications -->
<Toaster />
