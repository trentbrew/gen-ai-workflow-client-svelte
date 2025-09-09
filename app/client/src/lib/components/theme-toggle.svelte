<script lang="ts">
  import { buttonVariants } from '$lib/components/ui/button/index.js'
  import { Sun, Moon } from '@lucide/svelte'
  import { mode, toggleMode, setMode } from 'mode-watcher'

  let computedTitle = $derived(() => (mode.current === 'light' ? 'Switch to dark' : 'Switch to light'))

  function onToggle() {
    toggleMode()
  }

  // Expose explicit setters if needed elsewhere
  function setDark() { setMode('dark') }
  function setLight() { setMode('light') }
</script>

<div class="flex items-center gap-2">
  <button
    type="button"
    aria-label="Toggle theme"
    title={computedTitle()}
    class={`relative ${buttonVariants({ variant: 'ghost', size: 'icon' })}`}
    onclick={onToggle}
  >
    <Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  </button>
</div>
