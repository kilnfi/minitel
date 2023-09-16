<script lang="ts">
    import type { PageServerData } from "./$types";

    export let data: PageServerData;
    export let txRaw : string = data.txRaw || "";
</script>

<div class="bg-white">
    <div class="mx-auto max-w-7xl">
        <div class="relative isolate overflow-hidden bg-gray-900 py-24 shadow-2xl rounded-3xl px-24">
            <h2 class="mx-auto max-w-2xl text-center font-bold tracking-tight text-white text-4xl">Decode raw transaction</h2>
            <p class="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
                Choose your blockchain and decode a raw transaction hex string into a JSON object. Get valuable insights into transaction details, including sender and recipient addresses, gas price, decoded inputs and more.
            </p>
            <form class="mx-auto mt-10">
                <label for="raw-tx" class="sr-only">Raw tx</label>
                <textarea
                        bind:value={txRaw}
                        rows="4"
                        id="raw-tx"
                        name="txRaw"
                        type="text"
                        required
                        class="min-w-0 w-full mb-3 flex-auto rounded-md border-0 bg-gray-800 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white text-sm leading-6"
                        placeholder="Enter raw transaction..."></textarea>

                {#if data.error}
                    <p class="text-red-600 mb-3">{data.error}</p>
                {/if}

                <div class="text-center">
                    <button
                            type="submit"
                            class="text-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Decode
                    </button>
                </div>
            </form>
            {#if data.html}
                <div class="overflow-auto dark-mode my-6">
                    <pre class="json-container rounded-md bg-gray-800">
                        {@html data.html}
                    </pre>
                </div>
            {/if}
            <svg viewBox="0 0 1024 1024" class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2" aria-hidden="true">
                <circle cx="512" cy="512" r="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fill-opacity="0.7" />
                <defs>
                    <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 512) rotate(90) scale(512)">
                        <stop stop-color="#7775D6" />
                        <stop offset="1" stop-color="#E935C1" stop-opacity="0" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    </div>
</div>