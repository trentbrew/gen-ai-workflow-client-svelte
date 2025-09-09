import WorkflowIcon from '@lucide/svelte/icons/workflow';
import BotIcon from '@lucide/svelte/icons/bot';
import PlayIcon from '@lucide/svelte/icons/play';
import WrenchIcon from '@lucide/svelte/icons/wrench';
import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import LayersIcon from '@lucide/svelte/icons/layers';
import ServerIcon from '@lucide/svelte/icons/server';

export type CollapsedSidebarPage = {
  title: string;
  url: string;
  icon: any;
};

export const pages: CollapsedSidebarPage[] = [
  { title: 'Tools', url: '/', icon: WrenchIcon },
  { title: 'Workflows', url: '/workflows', icon: WorkflowIcon },
  { title: 'Agents', url: '/agents', icon: BotIcon },
  { title: 'Playground', url: '/playground', icon: PlayIcon },
  { title: 'Collections', url: '/collections', icon: BookOpenIcon },
  { title: 'Templates', url: '/templates', icon: LayersIcon },
  { title: 'MCP Servers', url: '/mcp-servers', icon: ServerIcon },
  { title: 'Projects', url: '/projects', icon: LightbulbIcon },
];
