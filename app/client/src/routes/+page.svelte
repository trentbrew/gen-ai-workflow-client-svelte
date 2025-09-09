<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Generic from './workflows/generic.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Button from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Skeleton from '$lib/components/ui/skeleton/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import {
    Workflow,
    Play,
    Loader2,
    AlertCircle,
    Share2,
    Bookmark,
    Download,
  } from '@lucide/svelte';
  import JsonHighlighter from '$lib/components/json-highlighter.svelte';
  import WorkflowProgress from '$lib/components/workflow-progress.svelte';
  import {
    getWorkflowDescriptions,
    getAvailableWorkflowIds,
    discoverWorkflowComponents,
    getWorkflowMetadata,
  } from '$lib/workflow-registry.js';
  import { toast } from 'svelte-sonner';

  let workflows = $state<string[]>([]);
  let selected = $state('');
  let question = $state('');
  let message = $state('');
  let pdfFile = $state<File | null>(null);
  let responseData = $state<any>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let showRawJson = $state(true);
  import { env } from '$env/dynamic/public';
  const API_URL = env.PUBLIC_API_URL || 'http://localhost:5050';

  // Component references for workflows
  let tiktokComponent: any = $state(null);
  let audioComponent: any = $state(null);
  let currentComponent: any = $state(null);

  // Resizable split state (config/results)
  let leftWidth = $state(420); // px; now controls left (results) panel
  let isDragging = $state(false);
  let isLarge = $state(false);

  // Get workflow descriptions from registry
  const workflowDescriptions = getWorkflowDescriptions();

  // Get available workflow IDs from registry (only those with components)
  const availableWorkflows = getAvailableWorkflowIds();

  // Get component map from registry
  const componentMap = discoverWorkflowComponents();

  const CurrentComponent = $derived.by(() => componentMap[selected] || Generic);

  // Determine if we should show the middle column (Workflow Steps)
  const showMiddleColumn = $derived.by(() => {
    if (!selected) return false;
    const metadata = getWorkflowMetadata(selected);
    return metadata?.category === 'workflows';
  });

  // Helpers for titles/subtitles
  const toTitle = (s: string) =>
    decodeURIComponent(s)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const pageTitle = $derived.by(() =>
    selected ? toTitle(selected) : 'Workflow Tester',
  );
  const pageSubtitle = $derived.by(() =>
    selected
      ? workflowDescriptions[selected] || 'AI workflow'
      : 'Test and interact with your AI workflows in real-time',
  );

  function updateIsLarge() {
    isLarge = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  }

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function startDrag(e: MouseEvent) {
    // Only enable on lg screens
    if (!isLarge) return;
    isDragging = true;
    const container = document.getElementById('split-container');
    if (!container) return;

    const onMove = (ev: MouseEvent) => {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      // Set limits: min 280px, max 70% of container
      const min = 280;
      const max = rect.width * 0.7;
      // Calculate left panel width from left edge: mouse position - container left
      const mousePosition = ev.clientX - rect.left;
      const next = clamp(mousePosition, min, max);
      leftWidth = Math.round(next);
    };

    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      try {
        localStorage.setItem('resultsPanelWidth', String(leftWidth));
      } catch {}
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }

  onMount(() => {
    updateIsLarge();
    // Restore saved width or set a responsive default
    try {
      const saved = localStorage.getItem('resultsPanelWidth');
      if (saved) {
        leftWidth = parseInt(saved, 10) || leftWidth;
      } else {
        leftWidth = Math.round(clamp(window.innerWidth * 0.34, 320, 560));
      }
    } catch {}
    const onResize = () => updateIsLarge();
    window.addEventListener('resize', onResize);
    (async () => {
      try {
        isLoading = true;
        const res = await fetch(`${API_URL}/workflows`);
        const json = await res.json();
        // Only include workflows with implemented frontend components
        workflows = (json.workflows || []).filter((wf: string) =>
          availableWorkflows.includes(wf),
        );

        // Get workflow from URL parameter
        const urlParams = new URLSearchParams($page.url?.search || '');
        const workflowParam = urlParams.get('workflow');

        if (workflowParam && availableWorkflows.includes(workflowParam)) {
          selected = workflowParam;
        } else {
          // Default to TikTok workflow if available, otherwise first workflow
          selected = workflows.includes('tiktok-video-generation')
            ? 'tiktok-video-generation'
            : workflows[0] || '';
        }
      } catch (e) {
        console.error('Failed to load workflows', e);
        error = 'Failed to load workflows. Please check your connection.';
      } finally {
        isLoading = false;
      }
    })();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  });

  // Watch for URL changes (runes-compatible)
  const search = $derived.by(() => $page.url?.search || '');
  $effect(() => {
    const urlParams = new URLSearchParams(search);
    const workflowParam = urlParams.get('workflow');
    if (
      workflowParam &&
      availableWorkflows.includes(workflowParam) &&
      workflowParam !== selected
    ) {
      selected = workflowParam;
    }
  });

  async function runWorkflow() {
    responseData = null;
    error = null;
    isLoading = true;

    // Show starting toast
    toast.info('Starting Workflow', {
      description: 'Your workflow is now running...',
      duration: 2000,
    });
    try {
      if (selected === 'rag-system') {
        if (!pdfFile) {
          error = 'Please select a PDF file';
          return;
        }
        const form = new FormData();
        form.append('pdf', pdfFile);
        form.append('question', question);
        const res = await fetch(`${API_URL}/workflows/rag-system`, {
          method: 'POST',
          body: form,
        });
        responseData = await res.json();
      } else if (
        (selected === 'tiktok-video-generation' ||
          selected === 'audio-understanding' ||
          selected === 'image-understanding' ||
          selected === 'video-understanding' ||
          selected === 'document-understanding' ||
          selected === 'branching-content') &&
        currentComponent?.run
      ) {
        // Use the component's run function which handles data properly
        await currentComponent.run();
      } else {
        const res = await fetch(`${API_URL}/workflows/${selected}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        responseData = await res.json();
      }
    } catch (e: any) {
      error = e.message;
      responseData = { error: e.message };
      toast.error('Workflow Failed', {
        description: e.message,
        duration: 5000,
      });
    } finally {
      isLoading = false;
    }
  }

  // Function to handle workflow execution from child components
  function handleWorkflowExecution(data: any) {
    responseData = data;
    error = null;

    // Show toast notification based on result
    if (data?.error) {
      toast.error('Workflow Failed', {
        description: data.error,
        duration: 5000,
      });
    } else {
      toast.success('Workflow Completed', {
        description: 'Your workflow has finished successfully',
        duration: 3000,
      });
    }
  }

  // Function to populate test data and run workflow
  function runWithTestData() {
    if (currentComponent && currentComponent.populateTestData) {
      currentComponent.populateTestData();
    }
    // Small delay to ensure form is populated before running
    setTimeout(() => {
      runWorkflow();
    }, 100);
  }
</script>

<div class="h-full w-full">
  <!-- Error display moved to second column -->

  <!-- Loading State -->
  {#if isLoading && workflows.length === 0}
    <div class="space-y-4">
      <Skeleton.Root class="h-8 w-64" />
      <Skeleton.Root class="h-32 w-full" />
    </div>
  {:else if !workflows.length}
    <Card.Root class="h-full">
      <Card.Content class="flex items-center justify-center py-8 h-full">
        <div class="flex flex-col items-center justify-center h-full space-y-4">
          <svg
            class="animate-spin h-8 w-8 text-muted-foreground mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <h3 class="font-semibold">Loading Workflows...</h3>
          <p class="text-sm text-muted-foreground">
            Please wait while we load available workflows.
          </p>
        </div>
      </Card.Content>
    </Card.Root>
  {:else}
    <!-- Responsive Layout Container -->
    <div class="h-full w-full">
      <!-- Mobile/Tablet: Stack vertically -->
      <div class="block lg:hidden space-y-4 p-4">
        <!-- Configuration Panel (Full width on mobile) -->
        <Card.Root class="h-auto ">
          <Card.Header class="border-b">
            <div class="flex items-center justify-between">
              <div>
                <Card.Title class="text-base">Configuration</Card.Title>
                <Card.Description class="text-sm"
                  >Workflow settings and inputs</Card.Description
                >
              </div>
              <!-- Run Workflow Buttons -->
              <div class="flex gap-2 ml-2">
                <Button.Root
                  onclick={runWorkflow}
                  disabled={isLoading}
                  size="sm"
                  variant="default"
                >
                  {#if isLoading}
                    <Loader2 class="h-3 w-3 animate-spin mr-1" />
                    Running...
                  {:else}
                    <Play class="h-3 w-3 mr-1" />
                    Run
                  {/if}
                </Button.Root>
                <Button.Root
                  onclick={runWithTestData}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  <Play class="h-3 w-3 mr-1" />
                  Run (Test Data)
                </Button.Root>
              </div>
            </div>
          </Card.Header>
          <Card.Content class="p-4">
            <CurrentComponent
              bind:this={currentComponent}
              {selected}
              apiUrl={API_URL}
              onResult={handleWorkflowExecution}
              response={responseData}
            />
          </Card.Content>
        </Card.Root>

        <!-- Workflow Steps (only for workflows) -->
        {#if showMiddleColumn}
          <Card.Root class="h-auto">
            <Card.Header class="border-b">
              <Card.Title class="text-base">Workflow Steps</Card.Title>
              <Card.Description class="text-sm"
                >Step-by-step execution progress</Card.Description
              >
            </Card.Header>
            <Card.Content class="p-8">
              <!-- Error Display -->
              {#if responseData?.error}
                <div
                  class="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg"
                >
                  <div class="flex items-start gap-2">
                    <AlertCircle
                      class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0"
                    />
                    <div class="space-y-1">
                      <div class="text-sm font-medium text-destructive">
                        Error
                      </div>
                      <div class="text-sm text-destructive/80">
                        {responseData.error}
                      </div>
                      {#if responseData.details}
                        <div class="text-xs text-muted-foreground mt-2">
                          {responseData.details}
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}

              {#if isLoading}
                <div class="flex items-center justify-center py-8">
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <Loader2 class="h-4 w-4 animate-spin" />
                    <span class="text-sm">Running workflow...</span>
                  </div>
                </div>
              {:else if responseData}
                <WorkflowProgress
                  workflowData={responseData}
                  {isLoading}
                  {error}
                />
              {:else}
                <div
                  class="flex items-center justify-center py-8 text-muted-foreground"
                >
                  <div class="text-center space-y-2">
                    <Play class="h-6 w-6 mx-auto opacity-50" />
                    <p class="text-sm">No workflow steps yet</p>
                    <p class="text-xs">Run a workflow to see progress</p>
                  </div>
                </div>
              {/if}
            </Card.Content>
          </Card.Root>
        {/if}

        <!-- Media & Outputs (Priority on mobile) -->
        {#if responseData}
          <Card.Root class="h-auto">
            <Card.Header class="border-b">
              <Card.Title class="text-base">Media & Outputs</Card.Title>
              <Card.Description class="text-sm"
                >Generated videos, images, and files</Card.Description
              >
            </Card.Header>
            <Card.Content class="p-4">
              <div class="space-y-4">
                <!-- TikTok Video Generation Results -->
                {#if selected === 'tiktok-video-generation' && responseData && !responseData.error}
                  <!-- Generated Video -->
                  {#if responseData.finalVideoUrl || responseData.finalVideo}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        Generated Video
                      </h4>
                      <div class="relative">
                        <video
                          src={responseData.finalVideoUrl ||
                            responseData.finalVideo}
                          controls
                          class="w-full rounded-lg border border-border shadow-sm"
                          style="max-height: 300px; object-fit: contain;"
                          onerror={(e) => console.error('Video load error:', e)}
                          onloadstart={() =>
                            console.log('Video loading started')}
                          oncanplay={() => console.log('Video can play')}
                        >
                          <track kind="captions" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  {/if}

                  <!-- Brand Profile Analysis -->
                  <!-- {#if responseData.brandProfile}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        Brand Profile Analysis
                      </h4>
                      <div class="p-4 bg-muted rounded-lg space-y-2">
                        <div>
                          <strong>Brand:</strong>
                          {responseData.brandProfile.brandName}
                        </div>
                        <div>
                          <strong>Mission:</strong>
                          {responseData.brandProfile.mission}
                        </div>
                        <div>
                          <strong>Target:</strong>
                          {responseData.brandProfile.targetAudience}
                        </div>
                        <div>
                          <strong>Values:</strong>
                          {responseData.brandProfile.values?.join(', ')}
                        </div>
                        {#if responseData.brandProfile.searchTerms}
                          <div class="space-y-1">
                            <strong>Search Terms:</strong>
                            <div class="flex flex-wrap gap-1">
                              {#each responseData.brandProfile.searchTerms.video || [] as term}
                                <span
                                  class="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                >
                                  {term}
                                </span>
                              {/each}
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if} -->

                  <!-- Generated Text -->
                  {#if responseData.textBlocks && responseData.textBlocks.length > 0}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        Generated Text
                      </h4>
                      <div class="p-4 bg-muted rounded-lg">
                        {#each responseData.textBlocks as textBlock}
                          <p class="text-sm">{textBlock}</p>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/if}

                <!-- Generic Results Display for non-TikTok workflows -->
                {#if selected !== 'tiktok-video-generation' && responseData && !responseData.error}
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium text-muted-foreground">
                      Results
                    </h4>
                    <div class="p-4 bg-muted rounded-lg">
                      <pre
                        class="text-xs whitespace-pre-wrap overflow-auto max-h-64">{JSON.stringify(
                          responseData,
                          null,
                          2,
                        )}</pre>
                    </div>
                  </div>
                {/if}
              </div>
            </Card.Content>
          </Card.Root>
        {/if}

        <!-- Raw JSON Response (Collapsible on mobile) -->
        <Card.Root class="h-auto">
          <Card.Header class="border-b">
            <div class="flex items-center justify-between w-full">
              <div>
                <Card.Title class="text-base">Raw JSON Response</Card.Title>
                <Card.Description class="text-sm"
                  >Complete API response data</Card.Description
                >
              </div>
              <Button.Root
                variant="ghost"
                size="sm"
                onclick={() => (showRawJson = !showRawJson)}
              >
                {showRawJson ? 'Hide' : 'Show'} Details
              </Button.Root>
            </div>
          </Card.Header>
          {#if showRawJson}
            <Card.Content class="p-0 rounded-lg">
              {#if responseData}
                <div class="space-y-2">
                  <div class="flex items-center gap-0">
                    <Badge
                      class={responseData.error
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'}
                      variant="secondary"
                    >
                      {responseData.error ? 'Error' : 'Success'}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    class="bg-muted/30 rounded-md border p-3 overflow-x-auto"
                  >
                    <pre class="text-xs whitespace-pre-wrap"><code
                        >{JSON.stringify(responseData, null, 2)}</code
                      ></pre>
                  </div>
                </div>
              {:else}
                <div
                  class="flex items-center justify-center py-8 text-muted-foreground"
                >
                  <div class="text-center space-y-2">
                    <AlertCircle class="h-6 w-6 mx-auto opacity-50" />
                    <p class="text-sm">No response data</p>
                    <p class="text-xs">Run a workflow to see JSON response</p>
                  </div>
                </div>
              {/if}
            </Card.Content>
          {/if}
        </Card.Root>
      </div>

      <!-- Desktop: Dynamic grid (2 or 3 columns) with transparent backgrounds and border separation -->
      <div
        class="hidden lg:grid h-full"
        class:lg:grid-cols-2={!showMiddleColumn}
        class:lg:grid-cols-3={showMiddleColumn}
      >
        <!-- Column 1: Configuration Panel -->
        <div class="col-span-1 h-full border-r border-border bg-transparent">
          <div class="h-full flex flex-col">
            <div class="border-b border-border flex-shrink-0 p-4">
              <div class="flex items-center justify-between mb-0">
                <div>
                  <h3 class="text-sm font-semibold">Configuration</h3>
                  <p class="text-xs text-muted-foreground">
                    Workflow settings and inputs
                  </p>
                </div>
                <!-- Run Workflow Buttons -->
                <div class="flex gap-2 ml-2">
                  <Button.Root
                    onclick={runWithTestData}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <Play class="h-3 w-3 mr-1" />
                    Run (Test Data)
                  </Button.Root>
                  <Button.Root
                    onclick={runWorkflow}
                    disabled={isLoading}
                    size="sm"
                    variant="default"
                  >
                    {#if isLoading}
                      <Loader2 class="h-3 w-3 animate-spin mr-1" />
                      Running...
                    {:else}
                      <Play class="h-3 w-3 mr-1" />
                      Run
                    {/if}
                  </Button.Root>
                </div>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <CurrentComponent
                bind:this={currentComponent}
                {selected}
                apiUrl={API_URL}
                onResult={handleWorkflowExecution}
                response={responseData}
              />
            </div>
          </div>
        </div>

        <!-- Column 2: Workflow Steps with Status & I/O (only for workflows) -->
        {#if showMiddleColumn}
          <div class="col-span-1 h-full border-r border-border bg-transparent">
            <div class="h-full flex flex-col">
              <div class="border-b border-border flex-shrink-0 p-4">
                <h3 class="text-sm font-semibold">Workflow Steps</h3>
                <p class="text-xs text-muted-foreground">
                  Step-by-step execution progress
                </p>
              </div>
              <div class="flex-1 overflow-y-auto p-4">
                <!-- Error Display -->
                {#if responseData?.error}
                  <div
                    class="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg"
                  >
                    <div class="flex items-start gap-2">
                      <AlertCircle
                        class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0"
                      />
                      <div class="space-y-1">
                        <div class="text-sm font-medium text-destructive">
                          Error
                        </div>
                        <div class="text-sm text-destructive/80">
                          {responseData.error}
                        </div>
                        {#if responseData.details}
                          <div class="text-xs text-muted-foreground mt-2">
                            {responseData.details}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}

                <!-- Real-time Progress Display -->
                {#if isLoading && currentComponent}
                  <div
                    class="mb-4 p-4 border border-primary bg-primary/10 rounded-lg"
                  >
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Progress</span>
                        <span class="text-sm text-muted-foreground"
                          >{currentComponent?.currentProgress || 0}%</span
                        >
                      </div>
                      <div class="w-full bg-muted rounded-full h-2">
                        <div
                          class="bg-primary h-2 rounded-full transition-all duration-300"
                          style="width: {currentComponent?.currentProgress ||
                            0}%"
                        ></div>
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {currentComponent?.currentMessage ||
                          'Starting workflow...'}
                      </div>

                      <!-- Workflow Steps -->
                      {#if currentComponent?.progressUpdates?.length > 0}
                        <div class="mt-4 space-y-2">
                          <h4 class="text-sm font-medium">Workflow Steps</h4>
                          <div class="max-h-32 overflow-y-auto space-y-1">
                            {#each currentComponent.progressUpdates as update}
                              <div class="text-xs p-2 bg-muted/50 rounded">
                                <span class="font-medium">{update.step}:</span>
                                {update.message}
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}

                {#if isLoading}
                  <div class="flex items-center justify-center py-8">
                    <div class="flex items-center gap-2 text-muted-foreground">
                      <Loader2 class="h-4 w-4 animate-spin" />
                      <span class="text-sm">Running workflow...</span>
                    </div>
                  </div>
                {:else if responseData}
                  <WorkflowProgress
                    workflowData={responseData}
                    {isLoading}
                    {error}
                  />
                {:else}
                  <div
                    class="flex items-center justify-center py-8 text-muted-foreground"
                  >
                    <div class="text-center space-y-2">
                      <Play class="h-6 w-6 mx-auto opacity-50" />
                      <p class="text-sm">No workflow steps yet</p>
                      <p class="text-xs">Run a workflow to see progress</p>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Column 3: Results & Outputs (Combined Media + JSON) -->
        <div class="col-span-1 h-full bg-transparent">
          <div class="h-full flex flex-col">
            <div class="border-b border-border flex-shrink-0 p-4">
              <div class="flex items-center justify-between w-full">
                <div>
                  <h3 class="text-sm font-semibold">Results & Outputs</h3>
                  <p class="text-xs text-muted-foreground">
                    Generated media and API response data
                  </p>
                </div>
                <Button.Root
                  variant="ghost"
                  size="sm"
                  onclick={() => (showRawJson = !showRawJson)}
                >
                  {showRawJson ? 'Hide' : 'Show'} JSON
                </Button.Root>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              {#if responseData}
                <div class="space-y-4 p-4">
                  <!-- Status Badge -->
                  <!-- <div class="flex items-center gap-2">
                    <Badge
                      class={responseData.error
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'}
                      variant="secondary"
                    >
                      {responseData.error ? 'Error' : 'Success'}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div> -->

                  <!-- Video Preview for TikTok Video Generation -->
                  {#if selected === 'tiktok-video-generation' && !responseData.error}
                    {#if responseData.finalVideoUrl || responseData.finalVideo}
                      <div class="space-y-2">
                        <h4 class="text-sm font-medium text-muted-foreground">
                          Generated Video
                        </h4>
                        <div class="relative">
                          <video
                            src={responseData.finalVideoUrl ||
                              responseData.finalVideo}
                            controls
                            class="w-full rounded-lg border border-border shadow-sm"
                            style="max-height: 1260px; object-fit: contain;"
                            onerror={(e) =>
                              console.error('Video load error:', e)}
                            onloadstart={() =>
                              console.log('Video loading started')}
                            oncanplay={() => console.log('Video can play')}
                          >
                            <track kind="captions" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    {:else}
                      <div class="space-y-2">
                        <h4 class="text-sm font-medium text-muted-foreground">
                          Generated Video
                        </h4>
                        <div
                          class="text-xs p-2 bg-muted/30 rounded border border-border"
                        >
                          <span class="font-medium text-orange-600"
                            >Status:</span
                          >
                          <span class="text-muted-foreground"
                            >Video processing in progress or failed</span
                          >
                        </div>
                      </div>
                    {/if}
                  {/if}

                  <!-- Brand Profile Analysis -->
                  {#if responseData.brandProfile}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        Brand Profile Analysis
                      </h4>
                      <div
                        class="p-3 bg-blue-500/10 rounded-lg border border-blue-200"
                      >
                        <div class="space-y-2">
                          <div class="text-sm font-bold text-blue-800">
                            Brand: {responseData.brandProfile.brandName}
                          </div>
                          <div class="text-xs text-blue-600">
                            Mission: {responseData.brandProfile.mission}
                          </div>
                          <div class="text-xs text-blue-600">
                            Target: {responseData.brandProfile.targetAudience}
                          </div>
                          <div class="text-xs text-blue-600">
                            Values: {responseData.brandProfile.values}
                          </div>
                          <div class="text-sm font-medium mb-1">
                            Search Terms:
                          </div>
                          <div class="flex flex-wrap gap-1">
                            {#each responseData.brandProfile.searchTerms.video as term}
                              <span
                                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >{term}</span
                              >
                            {/each}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}

                  <!-- Generated Text -->
                  {#if responseData.textBlocks}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        Generated Text
                      </h4>
                      <div class="space-y-1">
                        {#each responseData.textBlocks as textBlock, index}
                          <div class="text-xs p-2 bg-muted/30 rounded border">
                            <span class="font-medium">{index + 1}.</span>
                            {textBlock}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- JSON Response (Collapsible) -->
                  {#if showRawJson}
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-muted-foreground">
                        API Response
                      </h4>
                      <div
                        class="bg-muted/30 rounded-md border p-3 overflow-x-auto"
                      >
                        <pre class="text-xs whitespace-pre-wrap"><code
                            >{JSON.stringify(responseData, null, 2)}</code
                          ></pre>
                      </div>
                    </div>
                  {/if}
                </div>
              {:else}
                <div
                  class="flex items-center justify-center py-8 text-muted-foreground"
                >
                  <div class="text-center space-y-2">
                    <Download class="h-6 w-6 mx-auto opacity-50" />
                    <p class="text-sm">No results yet</p>
                    <p class="text-xs">Run a workflow to see outputs</p>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
