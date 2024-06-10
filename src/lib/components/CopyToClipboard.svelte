<script lang="ts">
  import { createTooltip, melt } from "@melt-ui/svelte";
  import { ClipboardCheckIcon, ClipboardIcon } from "lucide-svelte";
  import { fade } from "svelte/transition";

  export let text: string;
  let isCopied = false;
  /**
   * The duration of the success icon shown before switching back to the copy icon.
   */
  const animationDuration = 1500;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, animationDuration);
    } catch (error) {
      console.error("Failed to copy text to clipboard", error);
    }
  };

  const {
    elements: { trigger, content, arrow },
    states: { open },
  } = createTooltip({
    positioning: {
      placement: "top",
    },
    openDelay: 0,
    closeDelay: 0,
    forceVisible: true,
  });
</script>

<button
  type="button"
  class="flex items-center gap-2
   rounded-lg bg-white p-1.5 text-gray-900
   shadow transition-colors hover:opacity-90 font-bold
   {$$restProps.class} {isCopied ? 'text-green-600' : ''}"
  on:click={copy}
  use:melt={$trigger}
>
  {#if isCopied}
    <ClipboardCheckIcon class="w-5 h-5" />
  {:else}
    <ClipboardIcon class="w-5 h-5" />
  {/if}
</button>

{#if $open}
  <div
    use:melt={$content}
    transition:fade={{ duration: 100 }}
    class=" z-10 rounded-lg bg-white shadow opacity-75"
  >
    <div use:melt={$arrow} />
    <p class="px-2 py-1 text-xs">
      {isCopied ? "Copied!" : "Copy to clipboard"}
    </p>
  </div>
{/if}
