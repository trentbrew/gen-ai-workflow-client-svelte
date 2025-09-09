<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js'
  import * as Input from '$lib/components/ui/input/index.js'
  import * as Label from '$lib/components/ui/label/index.js'
  import { Loader2, Code, Play, FileText, Terminal } from '@lucide/svelte'

  export let apiUrl: string
  export let onResult: (data: any) => void = () => {}

  let prompt = 'Write a Python function that calculates the factorial of a number and test it with 5'
  let isLoading = false
  let selectedLanguage = 'python'
  let timeout = 5000
  let useCodeExecution = false
  let responseViewMode = 'formatted' // 'formatted' or 'raw'
  let result: any = null

  const languages = [
    { value: 'python', label: 'Python', description: 'Great for data science, algorithms, and general programming' },
    { value: 'javascript', label: 'JavaScript', description: 'Perfect for web development and Node.js applications' },
  ]

  async function run() {
    if (!prompt.trim()) return

    isLoading = true
    try {
      const options = {
        language: selectedLanguage,
        timeout: timeout,
        useCodeExecution: useCodeExecution,
      }

      const res = await fetch(`${apiUrl}/workflows/code-execution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, options }),
      })
      const response = await res.json()
      result = response
      onResult(response)
    } catch (error: any) {
      result = { error: error.message }
      onResult({ error: error.message })
    } finally {
      isLoading = false
    }
  }
</script>

<div class="space-y-6">
  <!-- Header Section -->
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <Code class="h-5 w-5 text-blue-500" />
      <h2 class="text-lg font-semibold">Code Execution</h2>
    </div>
    <p class="text-sm text-muted-foreground">
      Generate and execute code with Gemini 2.5 Flash. Supports Python and JavaScript with local execution.
    </p>
  </div>

  <!-- Main Configuration -->
  <div class="space-y-4">
    <div class="space-y-2">
      <Label.Root for="prompt" class="text-sm font-medium">Code Prompt</Label.Root>
      <Input.Root
        id="prompt"
        bind:value={prompt}
        placeholder="Describe the code you want to generate and execute..."
        class="w-full min-h-[80px]"
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading && prompt.trim()) {
            e.preventDefault()
            run()
          }
        }}
      />
      <p class="text-xs text-muted-foreground">Press Ctrl+Enter (or Cmd+Enter) to run quickly</p>
    </div>

    <!-- Configuration Options -->
    <div class="space-y-4">
      <div class="space-y-2">
        <Label.Root for="language" class="text-sm font-medium">Programming Language</Label.Root>
        <select
          id="language"
          bind:value={selectedLanguage}
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#each languages as language}
            <option value={language.value}>{language.label}</option>
          {/each}
        </select>
        <p class="text-xs text-muted-foreground">
          {languages.find((l) => l.value === selectedLanguage)?.description}
        </p>
      </div>

      <div class="space-y-2">
        <Label.Root for="timeout" class="text-sm font-medium">Timeout (ms)</Label.Root>
        <Input.Root id="timeout" type="number" bind:value={timeout} min="1000" max="30000" step="1000" class="w-full" />
        <p class="text-xs text-muted-foreground">Execution timeout in milliseconds</p>
      </div>

      <div class="space-y-2">
        <Label.Root class="text-sm font-medium">Options</Label.Root>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useCodeExecution"
            bind:checked={useCodeExecution}
            class="rounded border-gray-300"
          />
          <Label.Root for="useCodeExecution" class="text-sm">Use Gemini Code Execution Tool</Label.Root>
        </div>
        <p class="text-xs text-muted-foreground">Enable Gemini's built-in code execution (Python only)</p>
      </div>
    </div>
  </div>

  <!-- Run Button -->
  <Button.Root onclick={run} disabled={isLoading || !prompt.trim()} class="w-full sticky bottom-4" size="lg">
    {#if isLoading}
      <span class="flex items-center gap-2">
        <Loader2 class="h-4 w-4 animate-spin" />
        <Terminal class="h-4 w-4" />
        Executing Code...
      </span>
    {:else}
      <span class="flex items-center gap-2">
        <Play class="h-4 w-4" />
        Execute Code
      </span>
    {/if}
  </Button.Root>

  <!-- Response View Toggle (only show when there's a result) -->
  {#if result && result.code}
    <div class="space-y-4 border-t pt-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Execution Results</h3>
        <div class="flex items-center gap-2">
          <Label.Root class="text-sm font-medium">View:</Label.Root>
          <div class="flex rounded-md border">
            <button
              class="px-3 py-1 text-sm rounded-l-md transition-colors {responseViewMode === 'formatted'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted'}"
              onclick={() => (responseViewMode = 'formatted')}
            >
              Formatted
            </button>
            <button
              class="px-3 py-1 text-sm rounded-r-md border-l transition-colors {responseViewMode === 'raw'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted'}"
              onclick={() => (responseViewMode = 'raw')}
            >
              Raw
            </button>
          </div>
        </div>
      </div>

      {#if responseViewMode === 'formatted'}
        <!-- Formatted View -->
        <div class="space-y-4">
          <!-- Code Block -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Code class="h-4 w-4 text-blue-500" />
              <Label.Root class="text-sm font-medium">Generated Code ({result.language})</Label.Root>
            </div>
            <div class="bg-muted rounded-lg p-4 overflow-x-auto">
              <pre class="text-sm"><code class="language-{result.language}">{result.code}</code></pre>
            </div>
          </div>

          <!-- Output Block -->
          {#if result.output}
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Terminal class="h-4 w-4 text-green-500" />
                <Label.Root class="text-sm font-medium">Execution Output</Label.Root>
              </div>
              <div class="bg-muted rounded-lg p-4">
                <pre class="text-sm whitespace-pre-wrap">{result.output}</pre>
              </div>
            </div>
          {/if}

          <!-- Model Info -->
          <div class="text-xs text-muted-foreground">
            Generated by {result.model || 'gemini-2.5-flash'}
          </div>
        </div>
      {:else}
        <!-- Raw View -->
        <div class="bg-muted rounded-lg p-4">
          <pre class="text-sm overflow-x-auto"><code>{JSON.stringify(result, null, 2)}</code></pre>
        </div>
      {/if}
    </div>
  {/if}
</div>
