<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js'
  import * as Input from '$lib/components/ui/input/index.js'
  import * as Label from '$lib/components/ui/label/index.js'
  import { Loader2 } from '@lucide/svelte'

  export const selected = 'image-generation'
  export let apiUrl: string
  export let onResult: (data: any) => void = () => {}

  let prompt = 'A serene landscape with mountains and a lake at sunset'
  let isLoading = false

  // The new workflow only needs a prompt for basic image generation
  async function run() {
    if (!prompt.trim()) {
      onResult({ error: 'Please enter a prompt' })
      return
    }

    isLoading = true
    try {
      // The new workflow expects just a prompt string
      const res = await fetch(`${apiUrl}/workflows/image-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const response = await res.json()
      onResult(response)
    } catch (error: any) {
      onResult({ error: error.message })
    } finally {
      isLoading = false
    }
  }
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label.Root for="prompt">Image Prompt</Label.Root>
    <Input.Root id="prompt" bind:value={prompt} placeholder="Describe the image you want to generate" class="w-full" />
  </div>

  <Button.Root onclick={run} disabled={isLoading || !prompt.trim()} class="w-full">
    {#if isLoading}
      <span class="flex items-center gap-2">
        <Loader2 class="h-4 w-4 animate-spin" />
        Generating Image...
      </span>
    {:else}
      Generate Image
    {/if}
  </Button.Root>
</div>
