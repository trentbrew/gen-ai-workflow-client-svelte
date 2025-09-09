<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
  import { page } from '$app/stores'

  let {
    label = 'Navigation',
    items,
  }: {
    label?: string
    items: {
      title: string
      url: string
      // this should be `Component` after @lucide/svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon?: any
      isActive?: boolean
      items?: {
        title: string
        url: string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        icon?: any
      }[]
    }[]
  } = $props()

  const currentWorkflow = $derived.by(() => $page.url.searchParams.get('workflow') || '')
  const workflowFrom = (url: string) => {
    try {
      return new URL(url, 'http://local').searchParams.get('workflow') || ''
    } catch {
      return ''
    }
  }

  // Collapsible state for the section itself
  let sectionOpen = $state(true)
</script>

<Collapsible.Root bind:open={sectionOpen} class="group/nav-section">
  <Collapsible.Trigger
    class="flex gap-3 w-full justify-between text-foreground/50 !font-normal cursor-pointer select-none"
  >
    <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
    <Sidebar.GroupLabel>
      <ChevronRightIcon
        class="ml-auto transition-transform duration-200 group-data-[state=open]/nav-section:rotate-90"
      />
    </Sidebar.GroupLabel>
  </Collapsible.Trigger>
  <Collapsible.Content>
    <Sidebar.Menu>
      {#each items as item (item.title)}
        {#if (item.items ?? []).length > 0}
          <Collapsible.Root
            open={item.isActive || (item.items ?? []).some((si) => workflowFrom(si.url) === currentWorkflow)}
            class="group/collapsible"
          >
            {#snippet child({ props })}
              <Sidebar.MenuItem {...props}>
                <Collapsible.Trigger>
                  {#snippet child({ props })}
                    <Sidebar.MenuButton {...props} tooltipContent={item.title}>
                      {#if item.icon}
                        <item.icon class="opacity-50" />
                      {/if}
                      <span>{item.title}</span>
                      <ChevronRightIcon
                        class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    </Sidebar.MenuButton>
                  {/snippet}
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Sidebar.MenuSub>
                    {#each item.items ?? [] as subItem (subItem.title)}
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton isActive={workflowFrom(subItem.url) === currentWorkflow}>
                          {#snippet child({ props })}
                            <a href={subItem.url} {...props}>
                              {#if subItem.icon}
                                <subItem.icon class="opacity-50" />
                              {/if}
                              <span>{subItem.title}</span>
                            </a>
                          {/snippet}
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              </Sidebar.MenuItem>
            {/snippet}
          </Collapsible.Root>
        {:else}
          <Sidebar.MenuItem>
            <a
              href={item.url}
              class="group flex flex-col gap-1 rounded-md px-2 py-1 hover:border-primary hover:shadow-sm transition-all
                {workflowFrom(item.url) === currentWorkflow ? 'border-primary bg-muted' : ''}"
              style="text-decoration: none;"
            >
              <div class="flex items-center gap-2">
                {#if item.icon}
                  <item.icon class="h-4 w-4 text-muted-foreground" />
                {/if}
                <span class="text-sm font-medium">{item.title}</span>
              </div>
              <!-- <div class="text-xs text-muted-foreground ml-7 opacity-80">Workflow description</div> -->
            </a>
          </Sidebar.MenuItem>
        {/if}
      {/each}
    </Sidebar.Menu>
  </Collapsible.Content>
</Collapsible.Root>
