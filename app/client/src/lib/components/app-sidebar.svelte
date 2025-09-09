<script lang="ts" module>
  import AudioWaveformIcon from '@lucide/svelte/icons/audio-waveform';
  import ChartPieIcon from '@lucide/svelte/icons/chart-pie';
  import CommandIcon from '@lucide/svelte/icons/command';
  import FrameIcon from '@lucide/svelte/icons/frame';
  import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
  import MapIcon from '@lucide/svelte/icons/map';
  import MusicIcon from '@lucide/svelte/icons/music';
  import VideoIcon from '@lucide/svelte/icons/video';
  import InfinityIcon from '@lucide/svelte/icons/infinity';
  import Settings2Icon from '@lucide/svelte/icons/settings-2';
  import WorkflowIcon from '@lucide/svelte/icons/workflow';
  import MessageSquareIcon from '@lucide/svelte/icons/message-square';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import GitBranchIcon from '@lucide/svelte/icons/git-branch';
  import CodeIcon from '@lucide/svelte/icons/code';
  import SquareTerminalIcon from '@lucide/svelte/icons/square-terminal';
  import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
  import config from '$lib/sidebar.config.json';

  // Map string to icon component
  const IconMap: Record<string, any> = {
    Workflow: WorkflowIcon,
    GitBranch: GitBranchIcon,
    FileText: FileTextIcon,
    MessageSquare: MessageSquareIcon,
    AudioWaveform: AudioWaveformIcon,
    Frame: FrameIcon,
    Command: CommandIcon,
    Code: CodeIcon,
    SquareTerminal: SquareTerminalIcon,
    Clapperboard: ClapperboardIcon,
    Infinity: InfinityIcon,
    Music: MusicIcon,
    Video: VideoIcon,
  };

  type Section = {
    label: string;
    icon?: string;
    items: Array<{ title: string; url: string; icon?: string; items?: any[] }>;
  };

  function attachIcons(items: any[]): any[] {
    return items.map((it) => ({
      ...it,
      icon: it.icon ? IconMap[it.icon] : undefined,
      items: it.items ? attachIcons(it.items) : undefined,
    }));
  }

  const sections = (config.sections as Section[]).map((sec) => ({
    label: sec.label,
    icon: sec.icon ? IconMap[sec.icon] : undefined,
    items: attachIcons(sec.items),
  }));

  // Keep teams/projects sample data
  const data = {
    user: {
      name: 'Trent Brew',
      email: 'trent@turtle.tech',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      { name: 'Turtle Labs', logo: GalleryVerticalEndIcon, plan: 'AI Studio' },
    ],
    sections,
  };
</script>

<script lang="ts">
  import NavMain from './nav-main.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import type { ComponentProps } from 'svelte';
  import SidebarRail from './sidebar-rail.svelte';

  let {
    ref = $bindable(null),
    collapsible = 'icon',
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();

  // Search state and filtering (instance state)
  let searchQuery = $state('');
  const normalized = (s: string) => s.toLowerCase().trim();
  const filteredSections = $derived.by(() => {
    const q = normalized(searchQuery);
    if (!q) return data.sections;
    return data.sections
      .map((sec) => ({
        ...sec,
        items: (sec.items || []).filter(
          (it) =>
            normalized(it.title).includes(q) ||
            normalized(sec.label).includes(q),
        ),
      }))
      .filter((sec) => (sec.items || []).length > 0);
  });
</script>

<Sidebar.Root
  bind:ref
  collapsible="icon"
  class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row z-20"
  {...restProps}
>
  <!-- <SidebarRail user={data.user} /> -->

  <Sidebar.Root
    {collapsible}
    {...restProps}
    class="group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none  pl-0 border-l duration-200 "
    style="transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1)"
  >
    <Sidebar.Header class="p-4 !pb-0 pt-5">
      <Sidebar.Menu>
        <Sidebar.MenuItem class="pb-3">
          <Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
            {#snippet child({ props })}
              <a href="##" {...props}>
                <div
                  class="bg-sidebar-primary/0 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                >
                  <img
                    alt="Layers Logo"
                    src="https://trentbrew.pockethost.io/api/files/swvnum16u65or8w/dppr49jikxy2f4v/layers_alpha_AfasFZtO9H.png?token="
                    class="size-7"
                  />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">Gen AI Playground</span>
                  <span class="truncate text-xs opacity-50">Trent Brew</span>
                </div>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      <Sidebar.Input placeholder="Type to search..." bind:value={searchQuery} />
    </Sidebar.Header>
    <Sidebar.Content class="p-5">
      {#if filteredSections.length === 0}
        <div class="px-1 py-2 text-sm text-muted-foreground">
          No matches found
        </div>
      {/if}
      {#each filteredSections as section (section.label)}
        <NavMain label={section.label} items={section.items} />
      {/each}
    </Sidebar.Content>
    <Sidebar.Rail />
  </Sidebar.Root>
</Sidebar.Root>
