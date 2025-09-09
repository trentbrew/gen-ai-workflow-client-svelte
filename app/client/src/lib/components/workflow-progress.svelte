<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import {
    CheckCircle,
    XCircle,
    Clock,
    Play,
    AlertCircle,
    Music,
    Video,
    Image,
    FileText,
    Zap,
  } from '@lucide/svelte';

  interface Props {
    workflowData?: any;
    isLoading?: boolean;
    error?: string | null;
  }

  let {
    workflowData = null,
    isLoading = false,
    error = null,
  }: Props = $props();

  // Parse workflow data to extract step information
  const workflowSteps = $derived.by(() => {
    if (!workflowData) return [];

    const steps = [];

    // Step 1: Brand Analysis
    if (workflowData.brandProfile) {
      steps.push({
        id: 'brand-analysis',
        name: 'Brand Analysis',
        icon: Zap,
        status: 'success',
        duration: '2.3s',
        input: workflowData.brandProfile.brandName || 'Product description',
        output: {
          brandName: workflowData.brandProfile.brandName,
          mission: workflowData.brandProfile.mission,
          searchTerms: workflowData.brandProfile.searchTerms,
        },
        details: workflowData.brandProfile,
      });
    }

    // Step 2: Text Generation
    if (workflowData.textBlocks) {
      steps.push({
        id: 'text-generation',
        name: 'Text Generation',
        icon: FileText,
        status: workflowData.textBlocks.length > 0 ? 'success' : 'error',
        duration: '1.8s',
        input: `${workflowData.textBlocks?.length || 0} text blocks needed`,
        output: workflowData.textBlocks,
        details: { textBlocks: workflowData.textBlocks },
      });
    }

    // Step 3: Video Search
    if (workflowData.downloadedVideos) {
      steps.push({
        id: 'video-search',
        name: 'Video Search',
        icon: Video,
        status: workflowData.downloadedVideos.length > 0 ? 'success' : 'error',
        duration: '3.1s',
        input: 'Search terms from brand analysis',
        output: `${workflowData.downloadedVideos.length} videos found`,
        details: { videos: workflowData.downloadedVideos },
      });
    }

    // Step 4: Image Search
    if (workflowData.downloadedImages) {
      steps.push({
        id: 'image-search',
        name: 'Image Search',
        icon: Image,
        status: workflowData.downloadedImages.length > 0 ? 'success' : 'error',
        duration: '2.1s',
        input: 'Search terms from brand analysis',
        output: `${workflowData.downloadedImages.length} images found`,
        details: { images: workflowData.downloadedImages },
      });
    }

    // Step 5: Video Processing
    if (workflowData.processedClips) {
      steps.push({
        id: 'video-processing',
        name: 'Video Processing',
        icon: Video,
        status: workflowData.processedClips.length > 0 ? 'success' : 'error',
        duration: '8.2s',
        input: `${workflowData.downloadedVideos?.length || 0} videos, ${workflowData.textBlocks?.length || 0} text blocks`,
        output: `${workflowData.processedClips.length} processed clips`,
        details: { clips: workflowData.processedClips },
      });
    }

    // Step 6: Final Assembly
    if (workflowData.finalVideo) {
      steps.push({
        id: 'final-assembly',
        name: 'Final Assembly',
        icon: Music,
        status: workflowData.finalVideo ? 'success' : 'error',
        duration: '4.5s',
        input: 'Processed clips, music file',
        output: workflowData.finalVideo
          ? 'Final video created'
          : 'Assembly failed',
        details: {
          finalVideo: workflowData.finalVideo,
          musicFile: workflowData.musicFile,
          hasMusic: !!workflowData.musicFile,
        },
      });
    }

    return steps;
  });

  // Get status icon and color
  function getStatusInfo(status: string) {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-300',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100/50',
          borderColor: 'border-red-300',
        };
      case 'running':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100/50',
          borderColor: 'border-blue-300',
        };
      default:
        return {
          icon: Play,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100/50',
          borderColor: 'border-gray-300',
        };
    }
  }

  // Format output for display
  function formatOutput(output: any): string {
    if (typeof output === 'string') return output;
    if (Array.isArray(output)) return `${output.length} items`;
    if (typeof output === 'object')
      return Object.keys(output).length > 0
        ? 'Object with data'
        : 'Empty object';
    return String(output);
  }
</script>

<div class="space-y-4 p-4">
  <!-- Workflow Header -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">Workflow Execution</h3>
      <p class="text-sm text-muted-foreground">
        {#if isLoading}
          Running workflow steps...
        {:else if error}
          Workflow failed
        {:else if workflowSteps.length > 0}
          {workflowSteps.filter((s) => s.status === 'success').length} of {workflowSteps.length}
          steps completed
        {:else}
          No workflow data available
        {/if}
      </p>
    </div>
    <Badge
      variant={error ? 'destructive' : isLoading ? 'secondary' : 'default'}
      class={error
        ? 'bg-red-600 text-white'
        : isLoading
          ? 'bg-blue-700 text-white'
          : 'bg-green-700 text-white'}
    >
      {#if isLoading}
        <Clock class="h-3 w-3 mr-1" />
        Running
      {:else if error}
        <XCircle class="h-3 w-3 mr-1" />
        Failed
      {:else}
        <CheckCircle class="h-3 w-3 mr-1" />
        Complete
      {/if}
    </Badge>
  </div>

  <!-- Error Display -->
  {#if error}
    <Card.Root class="border-red-200 bg-red-50 p-4">
      <Card.Content class="p-4">
        <div class="flex items-center gap-2 text-red-700">
          <AlertCircle class="h-4 w-4" />
          <span class="font-medium">Workflow Error</span>
        </div>
        <p class="text-sm text-red-600 mt-1">{error}</p>
      </Card.Content>
    </Card.Root>
  {/if}

  <!-- Workflow Steps -->
  <div class="space-y-5">
    {#each workflowSteps as step, index (step.id)}
      {@const statusInfo = getStatusInfo(step.status)}
      <Card.Root
        class="border-l-3 {statusInfo.borderColor} {statusInfo.bgColor} rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <Card.Content class="px-6 rounded-lg">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-0">
              <!-- <div class="flex-shrink-0 mt-0.5 mr-4">
                {#if statusInfo.icon}
                  {@const IconComponent = statusInfo.icon}
                  <span
                    class="inline-flex items-center justify-center rounded-full bg-white/0 border-none border-white/10 shadow-sm h-8 w-8"
                  >
                    <IconComponent class="h-5 w-5 {statusInfo.color}" />
                  </span>
                {/if}
              </div> -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <h4 class="font-semibold text-base tracking-tight">
                    {step.name}
                  </h4>
                  <Badge
                    variant="outline"
                    class="text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10"
                  >
                    {step.duration}
                  </Badge>
                </div>
                <div class="mt-3 space-y-1">
                  <div class="text-xs text-muted-foreground">
                    <span class="font-medium text-foreground/80">Input:</span>
                    <span class="ml-1">{step.input}</span>
                  </div>
                  <div class="text-xs text-muted-foreground">
                    <span class="font-medium text-foreground/80">Output:</span>
                    <span class="ml-1">{formatOutput(step.output)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-shrink-0 ml-4">
              <statusInfo.icon class="h-5 w-5 {statusInfo.color}" />
            </div>
          </div>

          <!-- Expandable Details -->
          <details class="mt-4 group">
            <summary
              class="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded"
              >View Details</summary
            >
            <div
              class="mt-3 p-3 bg-black/10 rounded-lg border border-black/10 text-xs font-mono"
            >
              <pre class="whitespace-pre-wrap break-all">{JSON.stringify(
                  step.details,
                  null,
                  2,
                )}</pre>
            </div>
          </details>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <!-- No Steps Message -->
  {#if !isLoading && !error && workflowSteps.length === 0}
    <Card.Root class="border-dashed !bg-transparent">
      <Card.Content class="p-8 text-center">
        <Play class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground">
          No workflow steps to display
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          Run a workflow to see step-by-step progress
        </p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
