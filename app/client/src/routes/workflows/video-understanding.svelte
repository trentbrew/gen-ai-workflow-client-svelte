<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import StructuredOutput from '$lib/components/structured-output.svelte';

  export let selected: string;
  export let apiUrl: string;
  export let onResult: (data: any) => void = () => {};
  export let response: any = null;

  let prompt = '';
  let videoFile: File | null = null;
  let isLoading = false;
  let diagram: string = '';
  let customFields: any[] = [];
  let videoPreview: string | null = null;

  // Default fields for video understanding analysis
  const defaultVideoFields = [
    {
      key: 'description',
      type: 'string',
      description: 'A detailed description of what is shown in the video',
      readonly: true,
    },
    {
      key: 'objects',
      type: 'array',
      description: 'List of objects or items visible in the video',
      readonly: true,
    },
    {
      key: 'actions',
      type: 'array',
      description: 'Actions or activities happening in the video',
      readonly: true,
    },
    {
      key: 'has_speech',
      type: 'boolean',
      description: 'Whether the video contains speech or dialogue',
      readonly: true,
    },
    {
      key: 'genre',
      type: 'string',
      description: 'The genre or category of the video content',
      readonly: true,
    },
    {
      key: 'mood',
      type: 'string',
      description: 'The overall mood or atmosphere of the video',
      readonly: true,
    },
  ];

  // Fetch diagram on load
  async function loadDiagram() {
    const res = await fetch(`${apiUrl}/workflows/video-understanding/diagram`);
    diagram = await res.text();
  }

  loadDiagram();

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      videoFile = file;
      // Create preview URL
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      videoPreview = URL.createObjectURL(file);
    }
  }

  async function run() {
    if (!videoFile) {
      onResult({ error: 'Video file is required' });
      return;
    }
    if (!prompt.trim()) {
      onResult({ error: 'Prompt is required' });
      return;
    }

    isLoading = true;
    try {
      // Add structured output fields
      const allFields = [...defaultVideoFields, ...customFields];

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('prompt', prompt);
      formData.append('structuredFields', JSON.stringify(allFields));

      const res = await fetch(`${apiUrl}/workflows/video-understanding`, {
        method: 'POST',
        body: formData,
      });
      const response = await res.json();
      onResult(response);
    } catch (error: any) {
      onResult({ error: error.message });
    } finally {
      isLoading = false;
    }
  }

  // Export the run function for the parent component
  export { run };

  // Clean up preview URL on component destroy
  function cleanup() {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  }
</script>

<div class="space-y-4 p-4">
  <div class="space-y-2">
    <Label.Root for="video">Video File</Label.Root>
    <Input.Root
      id="video"
      type="file"
      accept="video/*"
      onchange={handleFileSelect}
      class="w-full"
    />
    {#if videoPreview}
      <div class="mt-2">
        <video
          src={videoPreview}
          controls
          class="w-full max-w-md rounded-lg border"
        >
          <track kind="captions" />
        </video>
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <Label.Root for="prompt">Analysis Prompt</Label.Root>
    <Input.Root
      id="prompt"
      bind:value={prompt}
      placeholder="Describe this video in detail..."
      class="w-full"
    />
  </div>

  <StructuredOutput
    defaultFields={defaultVideoFields}
    bind:customFields
    title="Video Analysis Fields"
  />

  <Button.Root
    onclick={run}
    disabled={isLoading || !videoFile || !prompt.trim()}
    class="w-full sticky bottom-4"
  >
    {#if isLoading}
      <span class="flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Analyzing Video...
      </span>
    {:else}
      Analyze Video
    {/if}
  </Button.Root>

  {#if diagram}
    <div class="mt-4 p-4 bg-muted rounded-lg">
      <h3 class="text-sm font-medium mb-2">Workflow Diagram</h3>
      <div class="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
        {diagram}
      </div>
    </div>
  {/if}
</div>

<svelte:head>
  <title>Video Understanding - Turtle Labs AI Studio</title>
</svelte:head>
