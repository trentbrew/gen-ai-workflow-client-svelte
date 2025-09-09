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
  let documentFile: File | null = null;
  let isLoading = false;
  let diagram: string = '';
  let customFields: any[] = [];
  let documentPreview: string | null = null;

  // Default fields for document understanding analysis
  const defaultDocumentFields = [
    {
      key: 'title',
      type: 'string',
      description: 'The main title or heading of the document',
      readonly: true,
    },
    {
      key: 'key_points',
      type: 'array',
      description: 'Main key points or important information from the document',
      readonly: true,
    },
    {
      key: 'document_type',
      type: 'string',
      description:
        'The type or category of document (report, manual, article, etc.)',
      readonly: true,
    },
    {
      key: 'has_charts',
      type: 'boolean',
      description:
        'Whether the document contains charts, diagrams, or visual elements',
      readonly: true,
    },
    {
      key: 'main_topics',
      type: 'array',
      description: 'Primary topics or subjects covered in the document',
      readonly: true,
    },
    {
      key: 'target_audience',
      type: 'string',
      description: 'The intended audience or readership of the document',
      readonly: true,
    },
  ];

  // Fetch diagram on load
  async function loadDiagram() {
    const res = await fetch(
      `${apiUrl}/workflows/document-understanding/diagram`,
    );
    diagram = await res.text();
  }

  loadDiagram();

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      documentFile = file;
      // Create preview URL for PDFs
      if (file.type === 'application/pdf') {
        if (documentPreview) {
          URL.revokeObjectURL(documentPreview);
        }
        documentPreview = URL.createObjectURL(file);
      }
    }
  }

  async function run() {
    if (!documentFile) {
      onResult({ error: 'Document file is required' });
      return;
    }
    if (!prompt.trim()) {
      onResult({ error: 'Prompt is required' });
      return;
    }

    isLoading = true;
    try {
      // Add structured output fields
      const allFields = [...defaultDocumentFields, ...customFields];

      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('prompt', prompt);
      formData.append('structuredFields', JSON.stringify(allFields));

      const res = await fetch(`${apiUrl}/workflows/document-understanding`, {
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
    if (documentPreview) {
      URL.revokeObjectURL(documentPreview);
    }
  }
</script>

<div class="space-y-4 p-4">
  <div class="space-y-2">
    <Label.Root for="document">Document File</Label.Root>
    <Input.Root
      id="document"
      type="file"
      accept=".pdf,.txt,.md,.html,.xml"
      onchange={handleFileSelect}
      class="w-full"
    />
    {#if documentPreview && documentFile?.type === 'application/pdf'}
      <div class="mt-2">
        <iframe
          src={documentPreview}
          class="w-full max-w-md h-64 rounded-lg border"
          title="Document preview"
        />
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <Label.Root for="prompt">Analysis Prompt</Label.Root>
    <Input.Root
      id="prompt"
      bind:value={prompt}
      placeholder="Analyze this document in detail..."
      class="w-full"
    />
  </div>

  <StructuredOutput
    defaultFields={defaultDocumentFields}
    bind:customFields
    title="Document Analysis Fields"
  />

  <Button.Root
    onclick={run}
    disabled={isLoading || !documentFile || !prompt.trim()}
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
        Analyzing Document...
      </span>
    {:else}
      Analyze Document
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
  <title>Document Understanding - Turtle Labs AI Studio</title>
</svelte:head>
