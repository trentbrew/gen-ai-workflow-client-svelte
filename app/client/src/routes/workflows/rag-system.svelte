<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js'
  import * as Input from '$lib/components/ui/input/index.js'
  import * as Label from '$lib/components/ui/label/index.js'
  import * as Switch from '$lib/components/ui/switch/index.js'

  export let selected: string
  export let apiUrl: string
  export let onResult: (data: any) => void = () => {}

  let pdfFile: File | null = null
  let question = ''
  let isLoading = false
  let useEnhanced = true

  function handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement)?.files
    if (files && files.length) pdfFile = files[0]
  }

  async function run() {
    if (!pdfFile) {
      onResult({ error: 'Please select a PDF file' })
      return
    }
    if (!question.trim()) {
      onResult({ error: 'Please enter a question' })
      return
    }

    isLoading = true
    try {
      const form = new FormData()
      form.append('pdf', pdfFile)
      form.append('question', question)
      form.append('enhanced', useEnhanced.toString())
      const res = await fetch(`${apiUrl}/workflows/rag-system`, { method: 'POST', body: form })
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
    <Label.Root for="pdf">PDF File</Label.Root>
    <Input.Root id="pdf" type="file" accept="application/pdf" onchange={handleFileChange} class="w-full" />
    {#if pdfFile}
      <p class="text-sm text-muted-foreground">Selected: {pdfFile.name}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <Label.Root for="question">Question</Label.Root>
    <Input.Root id="question" bind:value={question} placeholder="Enter your question..." class="w-full" />
  </div>

  <div class="flex items-center space-x-2">
    <Switch.Root bind:checked={useEnhanced} />
    <Label.Root for="enhanced" class="text-sm">Enhanced Mode (Gemini 2.5 Flash)</Label.Root>
  </div>
  <p class="text-xs text-muted-foreground">
    {useEnhanced
      ? 'Uses latest document understanding with visual analysis of images, charts, and tables'
      : 'Uses traditional text-based RAG with embeddings'}
  </p>

  <Button.Root onclick={run} disabled={isLoading || !pdfFile || !question.trim()} class="w-full">
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
