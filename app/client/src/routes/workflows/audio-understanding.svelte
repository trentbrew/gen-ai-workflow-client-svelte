<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import { Loader2 } from '@lucide/svelte';
  import StructuredOutput from '$lib/components/structured-output.svelte';

  export let apiUrl: string;
  export let onResult: (data: any) => void = () => {};
  export let response: any = null;

  let audioFile: File | null = null;
  let prompt = 'Describe this audio clip in detail';
  let isLoading = false;
  let customFields: any[] = [];

  // Default fields for audio analysis
  const defaultAudioFields = [
    {
      key: 'description',
      type: 'string',
      description:
        'A detailed description of the audio content and characteristics',
      readonly: true,
    },
    {
      key: 'mood',
      type: 'string',
      description: 'The emotional atmosphere or feeling conveyed by the audio',
      readonly: true,
    },
    {
      key: 'tone',
      type: 'string',
      description:
        'The overall tonal quality (e.g., bright, dark, warm, harsh)',
      readonly: true,
    },
    {
      key: 'genre',
      type: 'string',
      description:
        'The musical or audio genre (e.g., classical, rock, ambient, speech)',
      readonly: true,
    },
    {
      key: 'bpm',
      type: 'number',
      description: 'Beats per minute (tempo) of the audio',
      readonly: true,
    },
    {
      key: 'key_signature',
      type: 'string',
      description: 'The musical key or tonal center of the audio',
      readonly: true,
    },
    {
      key: 'transcription',
      type: 'string',
      description: 'Text transcription of any spoken words or lyrics',
      readonly: true,
    },
  ];

  function handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement)?.files;
    if (files && files.length) audioFile = files[0];
  }

  async function run() {
    if (!audioFile) {
      onResult({ error: 'Audio file is required' });
      return;
    }

    isLoading = true;
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('prompt', prompt);

      // Add structured output fields
      const allFields = [...defaultAudioFields, ...customFields];
      formData.append('structuredFields', JSON.stringify(allFields));

      const res = await fetch(`${apiUrl}/workflows/audio-understanding`, {
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
</script>

<div class="space-y-4 p-4">
  <div class="space-y-2">
    <Label.Root for="audio-file">Upload Audio File</Label.Root>
    <Input.Root
      id="audio-file"
      type="file"
      accept="audio/*"
      onchange={handleFileChange}
      class="w-full"
    />
    {#if audioFile}
      <p class="text-sm text-muted-foreground">Selected: {audioFile.name}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <Label.Root for="prompt">Prompt</Label.Root>
    <Input.Root
      id="prompt"
      bind:value={prompt}
      placeholder="Describe this audio clip in detail"
      class="w-full"
    />
  </div>

  <StructuredOutput
    defaultFields={defaultAudioFields}
    bind:customFields
    title="Audio Analysis Fields"
  />

  <Button.Root
    onclick={run}
    disabled={isLoading || !audioFile}
    class="w-full sticky bottom-4"
  >
    {#if isLoading}
      <span class="flex items-center gap-2">
        <Loader2 class="h-4 w-4 animate-spin" />
        Analyzing Audio...
      </span>
    {:else}
      Analyze Audio
    {/if}
  </Button.Root>
</div>
