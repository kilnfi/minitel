<script lang="ts">
  import type { PageServerData } from "./$types";
  import { navigating, page } from "$app/stores";
  import { createSelect, melt } from "@melt-ui/svelte";
  import { ChevronDown } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import { PROTOCOLS, protocol } from "$lib/protocol";
  import { EXAMPLE_LINKS } from "$lib/examples";
  import { afterNavigate } from "$app/navigation";

  export let data: PageServerData;

  const {
    elements: { trigger, menu, option, label },
    states: { selectedLabel, open, selected },
  } = createSelect({
    forceVisible: true,
    name: "protocol",
    defaultSelected: { value: $protocol.token, label: $protocol.name },
    positioning: { placement: "bottom", fitViewport: true, sameWidth: true },
    preventScroll: false,
  });

  let tx = $page.url.searchParams.get("tx") ?? "";

  afterNavigate((nav) => {
    let _tx = nav.to?.url.searchParams.get("tx");
    if (_tx) tx = _tx;
  });

  $: tryMeLink = EXAMPLE_LINKS[$selected?.value ?? "eth"];
</script>

<div>
  <h2 class="mx-auto max-w-2xl text-center font-bold tracking-tight text-white text-4xl">
    Raw transaction decoder
  </h2>

  <p class="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
    Choose your blockchain and decode a raw transaction hex string into a JSON object. Get valuable
    insights into transaction details, including sender and recipient addresses, gas price, decoded
    inputs and more.
  </p>

  <form class="mx-auto mt-10">
    <div class="flex items-center justify-between mb-4">
      <label class="sr-only" use:melt={$label}>Protocol</label>

      <input value={$selected?.value} name="protocol" type="hidden" />

      <button
        type="button"
        class="
          flex h-10 w-[200px] items-center
          justify-between rounded-lg bg-white px-3 py-2
          text-gray-900 shadow transition-opacity hover:opacity-90
        "
        use:melt={$trigger}
      >
        {$selectedLabel || "Select a protocol"}
        <ChevronDown class="square-5" />
      </button>

      {#if $open}
        <div
          class="
            z-10 flex max-h-[300px] flex-col
            overflow-y-auto rounded-lg bg-white p-1
            shadow focus:!ring-0
          "
          use:melt={$menu}
          transition:fade={{ duration: 150 }}
        >
          {#each PROTOCOLS as protocol (protocol.token)}
            <div
              class="
                relative rounded-lg py-1 px-4 text-gray-900
                focus:z-10 cursor-pointer
                data-[highlighted]:bg-gray-100 data-[selected]:bg-gray-100
              "
              use:melt={$option({ value: protocol.token, label: protocol.name })}
            >
              {protocol.name}
            </div>
          {/each}
        </div>
      {/if}

      {#if tryMeLink}
        <a href={tryMeLink} class="text-sm font-semibold leading-6 text-white">
          Try me <span aria-hidden="true">→</span>
        </a>
      {/if}
    </div>

    <label for="transaction" class="sr-only">Raw tx</label>
    <textarea
      bind:value={tx}
      rows="4"
      id="transaction"
      name="tx"
      required
      class="
        min-w-0 w-full mb-3 flex-auto rounded-md border-0
        bg-gray-800 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset
        ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white leading-6
      "
      placeholder="Enter raw transaction..."
    ></textarea>

    <div class="flex items-center justify-center gap-4">
      <button
        disabled={$navigating?.type === "goto"}
        type="submit"
        class="
          flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm
          font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:bg-gray-400
        "
      >
        Decode
      </button>
    </div>
  </form>

  {#if data.html}
    <div class="overflow-auto dark-mode my-6 bg-gray-800 rounded-md">
      <pre class="json-container bg-gray-800 p-2">{@html data.html}</pre>
    </div>
  {:else if data.error}
    <p class="text-red-600 my-6 px-4 py-2 bg-red-50 border rounded-lg">
      {data.error}
    </p>
  {/if}
</div>
