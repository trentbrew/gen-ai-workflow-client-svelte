<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js'
  import * as Input from '$lib/components/ui/input/index.js'
  import * as Label from '$lib/components/ui/label/index.js'

  export let selected: string
  export let apiUrl: string
  export let onResult: (data: any) => void = () => {}

  let message = ''
  let isLoading = false

  async function run() {
    if (!message.trim()) return

    isLoading = true
    try {
      const res = await fetch(`${apiUrl}/workflows/simple-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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
    <Label.Root for="message">Message</Label.Root>
    <Input.Root
      id="message"
      bind:value={message}
      placeholder="Enter your message..."
      class="w-full"
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && message.trim()) {
          e.preventDefault()
          run()
        }
      }}
    />
  </div>

  <Button.Root onclick={run} disabled={isLoading || !message.trim()} class="w-full sticky bottom-4">
    {#if isLoading}
      <span class="flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Running...
      </span>
    {:else}
      Run Workflow
    {/if}
  </Button.Root>
</div>
