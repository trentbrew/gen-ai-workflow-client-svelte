<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import { Loader2 } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import StructuredOutput from '$lib/components/structured-output.svelte';

  let { selected, apiUrl, onResult, response = null } = $props();

  let imageFile: File | null = $state(null);
  let imagePreviewUrl: string | null = $state(null);
  let prompt = $state('Describe this image in detail');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let customFields = $state([]);

  // Default fields for image analysis
  const defaultImageFields = [
    {
      key: 'description',
      type: 'string',
      description: 'A detailed description of what is shown in the image',
      readonly: true,
    },
    {
      key: 'mood',
      type: 'string',
      description: 'The emotional atmosphere or feeling conveyed by the image',
      readonly: true,
    },
    {
      key: 'tone',
      type: 'string',
      description: 'The overall visual tone (e.g., bright, dark, warm, cool)',
      readonly: true,
    },
    {
      key: 'color_palette',
      type: 'array',
      description: 'List of dominant colors present in the image',
      readonly: true,
    },
    {
      key: 'art_style',
      type: 'string',
      description:
        'The artistic style or movement (e.g., realistic, abstract, impressionist)',
      readonly: true,
    },
    {
      key: 'medium',
      type: 'string',
      description:
        'The medium or technique used (e.g., digital, oil painting, photograph)',
      readonly: true,
    },
  ];

  function handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement)?.files;
    if (files && files.length) {
      const file = files[0];
      const validTypes = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
      ];
      if (validTypes.includes(file.type)) {
        // Clean up previous preview URL
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }

        imageFile = file;
        imagePreviewUrl = URL.createObjectURL(file);
        error = null;
      } else {
        error = `Unsupported file type: ${file.type}. Please upload PNG, JPEG, WEBP, HEIC, or HEIF.`;
        imageFile = null;
        imagePreviewUrl = null;
      }
    }
  }

  // Cleanup function to revoke object URLs when component is destroyed
  function cleanup() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }

  // Cleanup on component destroy
  onDestroy(cleanup);

  async function run() {
    if (!imageFile) {
      onResult({ error: 'Image file is required' });
      return;
    }

    isLoading = true;
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      formData.append('mimeType', imageFile.type);

      // Add structured output fields
      const allFields = [...defaultImageFields, ...customFields];
      formData.append('structuredFields', JSON.stringify(allFields));

      const res = await fetch(`${apiUrl}/workflows/image-understanding`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: 'Invalid server response' }));
        throw new Error(error.error || 'Request failed');
      }

      const response = await res.json();

      if (response.error) {
        throw new Error(response.error);
      }

      onResult({
        ...response,
        model: response.model || 'gemini-1.5-pro',
        mimeType: imageFile.type,
        imagePreview: imagePreviewUrl,
        imageName: imageFile.name,
      });
    } catch (error: any) {
      onResult({
        error: error?.message || 'Failed to analyze image',
        details:
          error?.details ||
          'Please try a different image or check the file format',
      });
    } finally {
      isLoading = false;
    }
  }

  // Export the run function for the parent component
  export { run };
</script>

<div class="space-y-4 p-4">
  <div class="space-y-2">
    <Label.Root for="image-file">Upload Image</Label.Root>
    <Input.Root
      id="image-file"
      type="file"
      accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
      onchange={handleFileChange}
      class="w-full"
    />
    {#if imageFile}
      <p class="text-sm text-muted-foreground">
        Selected: {imageFile.name} ({imageFile.type})
      </p>
    {/if}
    {#if error}
      <p class="text-sm text-destructive">{error}</p>
    {/if}
  </div>

  {#if imagePreviewUrl}
    <div class="space-y-2">
      <Label.Root>Image Preview</Label.Root>
      <div class="relative">
        <img
          src={imagePreviewUrl}
          alt="Uploaded file preview"
          class="w-full max-w-md mx-auto rounded-lg border border-border shadow-sm"
          style="max-height: 300px; object-fit: contain;"
        />
      </div>
    </div>
  {/if}

  <div class="space-y-2">
    <Label.Root for="prompt">Prompt</Label.Root>
    <Input.Root
      id="prompt"
      bind:value={prompt}
      placeholder="Describe this image in detail"
      class="w-full"
    />
  </div>

  <StructuredOutput
    defaultFields={defaultImageFields}
    bind:customFields
    title="Image Analysis Fields"
  />

  <Button.Root
    onclick={run}
    disabled={isLoading || !imageFile || !!error}
    class="w-full sticky bottom-4"
  >
    {#if isLoading}
      <span class="flex items-center gap-2">
        <Loader2 class="h-4 w-4 animate-spin" />
        Analyzing Image...
      </span>
    {:else}
      Analyze Image
    {/if}
  </Button.Root>
</div>
