<script lang="ts">
  import * as Button from '$lib/components/ui/button/index.js';
  import * as Input from '$lib/components/ui/input/index.js';
  import * as Label from '$lib/components/ui/label/index.js';
  import StructuredOutput from '$lib/components/structured-output.svelte';

  export let selected: string;
  export let apiUrl: string;
  export let onResult: (data: any) => void = () => {};
  export let response: any = null;

  let message = '';
  let isLoading = false;
  let diagram: string = '';
  let customFields: any[] = [];

  // Default fields for orchestration analysis
  const defaultOrchestrationFields = [
    {
      key: 'intent',
      type: 'string',
      description:
        'The detected intent of the message (question, statement, other)',
      readonly: true,
    },
    {
      key: 'sentiment',
      type: 'string',
      description:
        'The emotional sentiment of the message (positive, negative, neutral)',
      readonly: true,
    },
    {
      key: 'topics',
      type: 'array',
      description: 'Key topics or subjects mentioned in the message',
      readonly: true,
    },
    {
      key: 'message_type',
      type: 'string',
      description:
        'The type of message (declarative, interrogative, imperative, etc.)',
      readonly: true,
    },
    {
      key: 'requires_response',
      type: 'boolean',
      description: 'Whether the message requires a response or action',
      readonly: true,
    },
    {
      key: 'references',
      type: 'array',
      description:
        'References to people, channels, or entities (words starting with @)',
      readonly: true,
    },
  ];

  // Fetch diagram on load
  async function loadDiagram() {
    const res = await fetch(`${apiUrl}/workflows/branching-content/diagram`);
    diagram = await res.text();
  }

  loadDiagram();

  async function run() {
    if (!message.trim()) {
      onResult({ error: 'Message is required' });
      return;
    }

    isLoading = true;
    try {
      // Add structured output fields
      const allFields = [...defaultOrchestrationFields, ...customFields];

      const res = await fetch(`${apiUrl}/workflows/branching-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, structuredFields: allFields }),
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
    <Label.Root for="message">Message</Label.Root>
    <Input.Root
      id="message"
      bind:value={message}
      placeholder="Enter your message..."
      class="w-full"
    />
  </div>

  <StructuredOutput
    defaultFields={defaultOrchestrationFields}
    bind:customFields
    title="Orchestration Analysis Fields"
  />

  <Button.Root
    onclick={run}
    disabled={isLoading || !message.trim()}
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
        Running...
      </span>
    {:else}
      Run Workflow
    {/if}
  </Button.Root>
</div>
