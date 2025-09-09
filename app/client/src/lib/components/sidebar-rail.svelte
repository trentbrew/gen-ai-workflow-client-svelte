<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import NavUser from './nav-user.svelte';
  import type { ComponentProps } from 'svelte';
  import { pages } from '$lib/routes/collapsed-sidebar';

  type User = { name: string; email: string; avatar: string };

  let {
    user,
    ...restProps
  }: { user: User } & ComponentProps<typeof Sidebar.Root> = $props();

  let activeItem = $state(pages[0]);
</script>

<Sidebar.Root
  collapsible="none"
  class=" bg-muted/30 !w-[calc(var(--sidebar-width-icon)_+_1px)] border-r z-99"
  {...restProps}
>
  <Sidebar.Header class="py-3">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
          {#snippet child({ props })}
            <a href="##" {...props}>
              <div
                class="bg-sidebar-primary/0 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <img
                  alt="Turtle Labs Logo"
                  src="https://turtle.pockethost.io/api/files/pbc_3037694218/vd9n1m7gd352k8d/a_g_32hrtr1kpq.png?token="
                  class="size-6"
                />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Turtle Labs</span>
                <span class="truncate text-xs">AI Studio</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupContent class="px-1.5 md:px-0">
        <Sidebar.Menu>
          {#each pages as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                tooltipContentProps={{
                  hidden: false,
                }}
                onclick={() => {
                  activeItem = item;
                }}
                isActive={activeItem.title === item.title}
                class="px-2.5 md:px-2"
              >
                {#snippet tooltipContent()}
                  {item.title}
                {/snippet}
                <item.icon />
                <span>{item.title}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer class="!p-0">
    <NavUser {user} />
  </Sidebar.Footer>
</Sidebar.Root>
