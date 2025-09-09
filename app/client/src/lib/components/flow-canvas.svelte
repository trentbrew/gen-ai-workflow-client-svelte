<script lang="ts">
  import { onMount } from 'svelte'
  let nodes: { id: string; x: number; y: number; label: string; meta?: any }[] = [
    { id: 'n1', x: 80, y: 80, label: 'Brand Analysis', meta: { fields: ['brandName', 'mission', 'keywords'] } },
    { id: 'n2', x: 320, y: 180, label: 'Pexels Search', meta: { fields: ['query', 'per_page', 'portraitOnly'] } },
    { id: 'n3', x: 560, y: 80, label: 'Final Assembler', meta: { fields: ['iterations', 'music', 'duration'] } },
  ]
  let selected: string | null = nodes[0].id

  let dragging: { id: string; offsetX: number; offsetY: number } | null = null

  function startDrag(e: MouseEvent, node: typeof nodes[0]) {
    dragging = { id: node.id, offsetX: e.offsetX, offsetY: e.offsetY }
    // select when starting drag
    selected = node.id
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) return
    const node = nodes.find((n) => n.id === dragging!.id)
    if (!node) return
    node.x = e.offsetX - dragging.offsetX + 20
    node.y = e.offsetY - dragging.offsetY + 12
  }

  function endDrag() {
    dragging = null
  }

  function selectNode(nodeId: string) {
    selected = nodeId
  }

  // Simple helper to get node center for connector lines
  function center(n: typeof nodes[0]) {
    return { x: n.x + 120 / 2, y: n.y + 56 / 2 }
  }

  // Expose nodes for debugging in console if needed
  onMount(() => {
    // no-op
  })
</script>

<style>
  .canvas {
    background: linear-gradient(90deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01));
    border-radius: 8px;
    min-height: 420px;
    padding: 12px;
  }
  .node {
    width: 120px;
    height: 56px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: grab;
  }
</style>

<div class="flex gap-4">
  <div class="canvas flex-1" on:mousemove={onMouseMove} on:mouseup={endDrag} on:mouseleave={endDrag}>
    <svg width="100%" height="420" preserveAspectRatio="xMidYMid meet" style="position:absolute;pointer-events:none">
    {#each nodes as n, i}
      {#if i < nodes.length - 0}
        <!-- draw simple lines from each to next -->
      {/if}
    {/each}
    {#if nodes.length >= 2}
      {#each nodes.slice(0, nodes.length - 1) as src, idx}
        {@const dst = nodes[idx + 1]}
        {@const c1 = center(src)}
        {@const c2 = center(dst)}
        <line x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
      {/each}
    {/if}
  </svg>

    {#each nodes as node}
      <div
        class="node absolute"
        style="transform: translate({node.x}px, {node.y}px); z-index: {selected === node.id ? 20 : 10}; outline: {selected === node.id ? '2px solid rgba(99,102,241,0.3)' : 'none'}"
        on:mousedown={(e) => startDrag(e as MouseEvent, node)}
        on:click={() => selectNode(node.id)}
      >
        <div>{node.label}</div>
      </div>
    {/each}

    <div class="mt-4 text-sm text-muted-foreground">This is a lightweight placeholder Flow Canvas. Replace with <code>svelte-flow</code> for full features.</div>
  </div>

  <!-- Inspector / Preview column -->
  <div style="width:360px;">
    <div class="p-4 bg-card rounded-lg shadow-sm">
      <div class="text-sm font-medium mb-2">Node Inspector</div>
      {#if selected}
        {@const node = nodes.find(n => n.id === selected)}
        {#if node}
          <div class="text-xs text-muted-foreground mb-2">{node.label}</div>
          <pre class="p-2 bg-gray-900 text-xs text-white rounded" style="max-height:200px;overflow:auto">{JSON.stringify(node.meta, null, 2)}</pre>
        {/if}
      {:else}
        <div class="text-sm text-muted-foreground">Select a node to view details.</div>
      {/if}

      <div class="mt-4 text-sm font-medium">Mobile Preview</div>
      <div class="mt-2 bg-black rounded-lg overflow-hidden" style="width:100%;height:320px;display:flex;align-items:center;justify-content:center">
        <!-- Placeholder for mobile preview; replace with live video or canvas preview -->
        <div style="color:#fff;opacity:0.85">Mobile preview placeholder</div>
      </div>
    </div>
  </div>
</div>
