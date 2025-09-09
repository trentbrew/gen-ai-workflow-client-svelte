/**
 * Workflow Registry - Automatically manages workflow components and metadata
 * This eliminates the need to manually maintain workflow lists in multiple places
 */

// Workflow metadata interface
export interface WorkflowMetadata {
  id: string;
  title: string;
  description: string;
  category: 'workflows' | 'tools' | 'actions' | 'agents';
  icon?: string;
  hasComponent: boolean;
}

// Workflow categories
export const WORKFLOW_CATEGORIES = {
  workflows: 'Workflows',
  tools: 'Tools',
  actions: 'Actions',
  agents: 'Agents',
} as const;

// Workflow registry - single source of truth for all workflow metadata
export const WORKFLOW_REGISTRY: Record<
  string,
  Omit<WorkflowMetadata, 'hasComponent'>
> = {
  // Workflows
  'tiktok-video-generation': {
    id: 'tiktok-video-generation',
    title: 'TikTok Video',
    description:
      'Generate complete TikTok videos with brand integration and content creation',
    category: 'workflows',
    icon: 'Video',
  },

  // Tools
  'audio-understanding': {
    id: 'audio-understanding',
    title: 'Audio Understanding',
    description: 'Analyze and understand audio content using Gemini 2.5 Flash',
    category: 'tools',
    icon: 'AudioWaveform',
  },
  'image-understanding': {
    id: 'image-understanding',
    title: 'Image Understanding',
    description: 'Analyze and understand images using Gemini 2.5 Flash',
    category: 'tools',
    icon: 'Frame',
  },
  'video-understanding': {
    id: 'video-understanding',
    title: 'Video Understanding',
    description: 'Analyze and understand video content using Gemini 2.5 Flash',
    category: 'tools',
    icon: 'Video',
  },
  'document-understanding': {
    id: 'document-understanding',
    title: 'Document Understanding',
    description: 'Analyze and understand documents using Gemini 1.5 Pro',
    category: 'tools',
    icon: 'FileText',
  },

  // Actions
  'branching-content': {
    id: 'branching-content',
    title: 'Orchestration',
    description: 'Orchestrate intelligent content routing and analysis',
    category: 'actions',
    icon: 'GitBranch',
  },
  'function-calling': {
    id: 'function-calling',
    title: 'Function Calling',
    description: 'Use Gemini to call functions based on user input',
    category: 'actions',
    icon: 'Command',
  },
  'code-execution': {
    id: 'code-execution',
    title: 'Code Execution',
    description: 'Generate and execute code with Gemini',
    category: 'actions',
    icon: 'Code',
  },
};

/**
 * Dynamically discover available workflow components
 */
export function discoverWorkflowComponents() {
  // This will be populated by the dynamic import in the main page
  const componentModules = import.meta.glob('../routes/workflows/*.svelte', {
    eager: true,
  });
  const componentMap: Record<string, any> = {};

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.svelte', '') || '';
    if (name !== 'generic') {
      // Exclude generic component
      componentMap[name] = (componentModules[path] as any).default;
    }
  }

  return componentMap;
}

/**
 * Get all workflows with component availability
 */
export function getAvailableWorkflows(): WorkflowMetadata[] {
  const components = discoverWorkflowComponents();

  return Object.values(WORKFLOW_REGISTRY).map((workflow) => ({
    ...workflow,
    hasComponent: !!components[workflow.id],
  }));
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(
  category: keyof typeof WORKFLOW_CATEGORIES,
): WorkflowMetadata[] {
  return getAvailableWorkflows().filter(
    (workflow) => workflow.category === category,
  );
}

/**
 * Get workflow descriptions for the main page
 */
export function getWorkflowDescriptions(): Record<string, string> {
  const descriptions: Record<string, string> = {};

  Object.values(WORKFLOW_REGISTRY).forEach((workflow) => {
    descriptions[workflow.id] = workflow.description;
  });

  return descriptions;
}

/**
 * Get available workflow IDs (for backward compatibility)
 */
export function getAvailableWorkflowIds(): string[] {
  return getAvailableWorkflows()
    .filter((workflow) => workflow.hasComponent)
    .map((workflow) => workflow.id);
}

/**
 * Get workflow metadata by ID
 */
export function getWorkflowMetadata(id: string): WorkflowMetadata | undefined {
  const registry = WORKFLOW_REGISTRY[id];
  if (!registry) return undefined;

  const components = discoverWorkflowComponents();

  return {
    ...registry,
    hasComponent: !!components[id],
  };
}
