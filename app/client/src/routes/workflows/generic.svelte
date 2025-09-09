<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import { Label } from '$lib/components/ui/label'

  let { apiUrl, selected } = $props()

  let responseData: any = $state(null)
  let message = $state('')

  async function run() {
    responseData = null
    try {
      const res = await fetch(`${apiUrl}/workflows/${selected}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      responseData = await res.json()
    } catch (e: any) {
      responseData = { error: e.message }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      run()
    }
  }
</script>

<form class="space-y-4 flex gap-4 items-center" onsubmit={run}>
  <div class="flex flex-col gap-2 w-full">
    <Label for="workflow-message">Prompt</Label>
    <Input
      id="workflow-message"
      type="text"
      bind:value={message}
      placeholder="Enter your message"
      class="w-full"
      onkeydown={handleKeydown}
    />
  </div>
  <Button type="submit" class="mt-2 w-fit">Run</Button>
</form>

{#if responseData}
  <h2 class="mt-6 text-2xl font-semibold">Response</h2>
  <pre class="bg-transparent rounded p-4 mt-2 h-full !text-xs break-all whitespace-pre-wrap">{JSON.stringify(
      responseData,
      null,
      2,
    )}</pre>
{/if}
