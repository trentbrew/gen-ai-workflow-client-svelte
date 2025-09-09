<script lang="ts">
  import WorkflowIcon from '@lucide/svelte/icons/workflow'
  import BotIcon from '@lucide/svelte/icons/bot'
  import PlayIcon from '@lucide/svelte/icons/play'
  import WrenchIcon from '@lucide/svelte/icons/wrench'
  import { page } from '$app/stores'

  const sidebarItems = [
    {
      id: 'workflows',
      label: 'Workflows',
      icon: WorkflowIcon,
      href: '/workflows',
      isActive: true, // Default active since we're on workflows page
      enabled: true,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: BotIcon,
      href: '/agents',
      enabled: false,
    },
    {
      id: 'playground',
      label: 'Playground',
      icon: PlayIcon,
      href: '/playground',
      enabled: false,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: WrenchIcon,
      href: '/tools',
      enabled: false,
    },
  ]

  $: currentPath = $page.url.pathname
</script>

<div class="w-16 h-full bg-sidebar border-r border-border flex flex-col items-center py-4 space-y-2">
  <!-- Logo/Brand Icon -->
  <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
    <span class="text-primary-foreground font-bold text-lg">T</span>
  </div>

  <!-- Navigation Items -->
  <nav class="flex flex-col space-y-2 w-full px-2">
    {#each sidebarItems as item}
      {#if item.enabled}
        <a
          href={item.href}
          class="group relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200
                 {currentPath.startsWith(item.href) || (item.isActive && currentPath === '/')
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
          title={item.label}
        >
          <svelte:component this={item.icon} class="w-5 h-5" />

          <!-- Tooltip on hover -->
          <div
            class="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
          >
            {item.label}
          </div>
        </a>
      {:else}
        <div
          class="group relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 opacity-50 cursor-not-allowed"
          title="{item.label} (Coming Soon)"
        >
          <svelte:component this={item.icon} class="w-5 h-5 text-muted-foreground" />

          <!-- Tooltip on hover -->
          <div
            class="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
          >
            {item.label} (Coming Soon)
          </div>
        </div>
      {/if}
    {/each}
  </nav>

  <!-- User Avatar (bottom) -->
  <div class="mt-auto">
    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
      <span class="text-white text-xs font-medium">U</span>
    </div>
  </div>
</div>

<style>
  /* Ensure tooltips don't interfere with layout */
  .group:hover .absolute {
    z-index: 1000;
  }
</style>
