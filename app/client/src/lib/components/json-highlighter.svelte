<script lang="ts">
  import { onMount } from 'svelte'
  import Prism from 'prismjs'
  import 'prismjs/components/prism-json'
  import 'prismjs/themes/prism-tomorrow.css'

  export let json: any

  let formattedJson = ''
  let highlighted = ''

  $: {
    try {
      formattedJson = JSON.stringify(json, null, 2)
      if (typeof window !== 'undefined') {
        highlighted = Prism.highlight(formattedJson, Prism.languages.json, 'json')
      }
    } catch (e) {
      formattedJson = String(json)
      highlighted = formattedJson
    }
  }

  onMount(() => {
    try {
      highlighted = Prism.highlight(formattedJson, Prism.languages.json, 'json')
    } catch (e) {
      highlighted = formattedJson
    }
  })
</script>

<pre
  class="language-json whitespace-pre-line break-words border p-4 !text-xs h-full overflow-y-auto !bg-transparent max-h-[calc(100vh-15rem)]"><code
    class="language-json">{@html highlighted}</code></pre>

<style>
  /* Override Prism styles for better dark mode compatibility */
  :global(.dark) :global(.token.property) {
    color: #a6e22e;
  }

  :global(.dark) :global(.token.string) {
    color: #f1fa8c;
  }

  :global(.dark) :global(.token.number) {
    color: #bd93f9;
  }

  :global(.dark) :global(.token.boolean) {
    color: #bd93f9;
  }

  :global(.dark) :global(.token.null) {
    color: #ff79c6;
  }
</style>
