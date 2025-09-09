<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js'
  import * as Input from '$lib/components/ui/input/index.js'
  import * as Label from '$lib/components/ui/label/index.js'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import JsonHighlighter from '$lib/components/json-highlighter.svelte'
  import { Plus, X, ChevronDown } from '@lucide/svelte'

  interface OutputField {
    key: string
    type: string
    description?: string
    readonly?: boolean
  }

  let {
    defaultFields = [],
    customFields = $bindable([]),
    title = 'Structured Output Fields',
    rawJson = undefined,
  }: {
    defaultFields: OutputField[]
    customFields: OutputField[]
    title?: string
    rawJson?: any
  } = $props()

  const fieldTypes = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'True/False' },
    { value: 'array', label: 'List' },
    { value: 'object', label: 'Object' },
  ]

  function addField() {
    customFields = [...customFields, { key: '', type: 'string', description: '' }]
  }

  function removeField(index: number) {
    customFields = customFields.filter((_, i) => i !== index)
  }

  function updateField(index: number, field: Partial<OutputField>) {
    customFields = customFields.map((f, i) => (i === index ? { ...f, ...field } : f))
  }

  // Get all fields (default + custom)
  let allFields = $derived([...defaultFields, ...customFields])

  // Collapsible state
  let openDefaults = $state(true)
  let openCustom = $state(false)
  let openPreview = $state(false)
  let openRaw = $state(false)
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label.Root class="text-sm font-medium">{title}</Label.Root>
    <p class="text-xs text-muted-foreground">
      Specify what information you want in the structured output. Default fields are always included.
    </p>
  </div>

  <!-- Default Fields (Read-only) -->
  {#if defaultFields.length > 0}
    <Collapsible.Root bind:open={openDefaults} class="space-y-2">
      <div class="flex items-center justify-between">
        <Label.Root class="text-xs font-medium text-muted-foreground">Default Fields</Label.Root>
        <Collapsible.Trigger class="h-6 w-6 rounded hover:bg-muted/50 inline-flex items-center justify-center">
          <ChevronDown class={`h-4 w-4 transition-transform ${openDefaults ? '' : '-rotate-90'}`} />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content class="space-y-2">
        {#each defaultFields as field}
          <div class="space-y-2 p-3 bg-muted/50 rounded-md">
            <div class="flex items-center gap-2">
              <Input.Root value={field.key} disabled class="flex-1 bg-background/50" placeholder="Field name" />
              <select
                value={field.type}
                disabled
                class="w-32 h-8 px-2 text-sm border border-input rounded-md bg-background/50"
              >
                {#each fieldTypes as type}
                  <option value={type.value}>{type.label}</option>
                {/each}
              </select>
              <div class="w-8 h-8 flex items-center justify-center text-muted-foreground">
                <span class="text-xs">✓</span>
              </div>
            </div>
            {#if field.description}
              <div class="text-xs text-muted-foreground ml-1">
                {field.description}
              </div>
            {/if}
          </div>
        {/each}
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}

  <!-- Custom Fields -->
  <Collapsible.Root bind:open={openCustom} class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Label.Root class="text-xs font-medium text-muted-foreground">Custom Fields</Label.Root>
        <Button.Root variant="outline" size="sm" onclick={addField} class="h-7 px-2">
          <Plus class="h-3 w-3 mr-1" />
          Add Field
        </Button.Root>
      </div>
      <Collapsible.Trigger class="h-6 w-6 rounded hover:bg-muted/50 inline-flex items-center justify-center">
        <ChevronDown class={`h-4 w-4 transition-transform ${openCustom ? '' : '-rotate-90'}`} />
      </Collapsible.Trigger>
    </div>

    <Collapsible.Content class="space-y-3">
      {#each customFields as field, index}
        <div class="space-y-2 p-3 border border-border rounded-md">
          <div class="flex items-center gap-2">
            <Input.Root
              value={field.key}
              oninput={(e) => updateField(index, { key: (e.target as HTMLInputElement).value })}
              placeholder="Field name (e.g., mood, genre, style)"
              class="flex-1"
            />
            <select
              value={field.type}
              onchange={(e) => updateField(index, { type: (e.target as HTMLSelectElement).value })}
              class="w-32 h-8 px-2 text-sm border border-input rounded-md bg-background"
            >
              {#each fieldTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
            <Button.Root
              variant="ghost"
              size="sm"
              onclick={() => removeField(index)}
              class="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X class="h-3 w-3" />
            </Button.Root>
          </div>
          <Input.Root
            value={field.description || ''}
            oninput={(e) => updateField(index, { description: (e.target as HTMLInputElement).value })}
            placeholder="Description (e.g., The emotional tone or feeling conveyed)"
            class="w-full text-sm"
          />
        </div>
      {/each}
    </Collapsible.Content>
  </Collapsible.Root>

  <!-- Preview -->
  {#if allFields.length > 0}
    <Collapsible.Root bind:open={openPreview} class="space-y-2">
      <div class="flex items-center justify-between">
        <Label.Root class="text-xs font-medium text-muted-foreground">Output Preview</Label.Root>
        <Collapsible.Trigger class="h-6 w-6 rounded hover:bg-muted/50 inline-flex items-center justify-center">
          <ChevronDown class={`h-4 w-4 transition-transform ${openPreview ? '' : '-rotate-90'}`} />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <div class="p-3 bg-muted/30 rounded-md border text-xs font-mono">
          <div class="text-muted-foreground mb-1">// Structured output will include:</div>
          {#each allFields as field}
            <div class="ml-2">
              <div class="flex items-center gap-2">
                <span class="text-blue-600">"{field.key}"</span>
                :
                <span class="text-green-600">{field.type}</span>
                {#if field.readonly}
                  <span class="text-muted-foreground text-xs">(default)</span>
                {/if}
              </div>
              {#if field.description}
                <div class="ml-4 text-xs text-muted-foreground italic">
                  // {field.description}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}

  <!-- Raw JSON Response (optional) -->
  {#if rawJson}
    <Collapsible.Root bind:open={openRaw} class="space-y-2">
      <div class="flex items-center justify-between">
        <Label.Root class="text-xs font-medium text-muted-foreground">Raw JSON Response</Label.Root>
        <Collapsible.Trigger class="h-6 w-6 rounded hover:bg-muted/50 inline-flex items-center justify-center">
          <ChevronDown class={`h-4 w-4 transition-transform ${openRaw ? '' : '-rotate-90'}`} />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <div class="p-3 bg-muted/30 rounded-md border text-xs">
          <JsonHighlighter json={rawJson} />
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
</div>
