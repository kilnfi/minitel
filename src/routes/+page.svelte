<script lang="ts">
    import type { PageServerData } from "./$types";
    import { navigating } from "$app/stores";
    import { createSelect, melt } from "@melt-ui/svelte";
    import { ChevronDown } from "lucide-svelte";
    import { fade } from 'svelte/transition';

    export let data: PageServerData;

    const protocols = [
      { name: "Ethereum", token: "ETH" },
      { name: "Solana", token: "SOL" },
      { name: "Cosmos", token: "ATOM" },
      { name: "Cardano", token: "ADA" },
    ];

    export const selectedProtocol = protocols.find(p => p.token === data.protocol) ?? protocols[0];

    const {
      elements: { trigger, menu, option, label },
      states: { selectedLabel, open },
    } = createSelect({
      forceVisible: true,
      name: "protocol",
      defaultSelected: { value: selectedProtocol.token, label: selectedProtocol.name },
      positioning: {
        placement: 'bottom',
        fitViewport: true,
        sameWidth: true,
      },
      preventScroll: false,
    });

    const getTryMeLink = (token) => {
      if (token === "ETH") {
        return `/?protocol=${token}&txRaw=02f902dc058202978477359400847735940a830223d4945fadfdb7efffd3b4aa03f0f29d9200cf5f191f318901bc16d674ec800000b902a4ca0bfcce0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003084eefa87510e735d0e6db65fde2c940517c197f252a0e40b90adf693d7198fa8c610a7b710b5fcaa54fe0dbbc87c0bb500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020010000000000000000000000bc86717bad3f8ccf86d2882a6bc351c94580a994000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060b15db0eddc3bdd62a10ec61ff120a6870d176b55249beab45223659547610e688195189e4f614447e68bfe055d903d1a0a74d82af486d01cfd75b9469fcdf776d99ef633ca3797c8670608a5f391f61694ae61f5573f79c90ea719fbe0d23c2d0000000000000000000000000000000000000000000000000000000000000001fb0c78163db38377fbe3e570d5a29ef4345b73087b9f60ec46a06589f6a6bb19c0808080`
      }
      if (token === "SOL") {
        return `/?protocol=${token}&txRaw=030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000061d1b66df290eb088227c3d92fb617046083673fb018071cae9c0f507b372fec0a5c45e0b43d46fb8a092f7fdcec2c52070497c1b1d681d17f33ee4324538a07deabe78a609fdf76d0f11d2006314cc98fa78f58e90c42d45bf3d36f24748b613eed28a1bb6142c79819b56f7e8fdac39fbb5af683de240d62837db99aa4a00a0301080c373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e15580b7b08f8a771c463905b0ece9f9fc642deef72b67f65954c920e801d602651f5f3871e65b84cc393458d0f23a413184cf2bb7093ae4e2c99d55b39a575c5f98e3135fcb53e71e6fafcb4da3a3cc36af1c76a1a7e72aa12eae1346d724c6c00000000000000000000000000000000000000000000000000000000000000004792650d1e9a4fe99721617c7d47c8712c14c20a76bf043368c6528c9090531a06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a1d817a502050b680791e6ce6db88e1e5b7150f61fc6790a4eb4d10000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff40000008cb7df03f52969a55bab8272195daca0b8619b10db0dffa05572f3ea636dfadd04040303090204040000000402000134000000000080c6a47e8d0300c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc0000000000602010a7400000000373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e373c6f8e84c6822a9f87035f65cccf899eef3fcdee61077041a93e1805bab24e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006060105080b07000402000000`
      }
      if (token === "ATOM") {
        return `/?protocol=${token}&txRaw=0aa1010a9e010a232f636f736d6f732e7374616b696e672e763162657461312e4d736744656c656761746512770a2d636f736d6f733139633966646834383876716a636c6c74777036386a6d3530796477796833366a7165617465761234636f736d6f7376616c6f706572313679733065673933356d6b71706b79646b6766636a39616765326175386c39366e61657265391a100a057561746f6d12073130303030303012670a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21039ce47b2a813d13876131a9c3be77e8c4afa49e948744abbee11f939e2a420f4612040a020801186612130a0d0a057561746f6d1204353030301080897a1a1174686574612d746573746e65742d30303120e0cd2a`
      }
      if (token === "ADA") {
        return `/?protocol=${token}&txRaw=84a50081825820ec36e28de84b27ead8da428efd8ab9a1d2c0aaaec5a5f485451bdf48cb2d795800018182583900491a1d0747fa91f319625e39076232ad4cc274e3257f345ced82dbb2a8565045c49103b521a3827ff64b98889350a22fa9a0b5ccf72b279b1b0000000254f866e0021a000493e0031a02612452048183028200581ca8565045c49103b521a3827ff64b98889350a22fa9a0b5ccf72b279b581ce54d5f9340218a9816cafafc92dc3d5212b6d149ce75e9637cbcd7e0a0f5f6`
      }

      return "";
    }

    export let txRaw : string = data.txRaw || "";

    $: selectedToken = protocols.find(p => p.name === $selectedLabel.trim())?.token ?? selectedProtocol.token;
    $: tryMeLink = getTryMeLink(selectedToken);

</script>

<div class="">
    <h2 class="mx-auto max-w-2xl text-center font-bold tracking-tight text-white text-4xl">Raw transaction decoder</h2>
    <p class="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
        Choose your blockchain and decode a raw transaction hex string into a JSON object. Get valuable insights into transaction details, including sender and recipient addresses, gas price, decoded inputs and more.
    </p>
    <form class="mx-auto mt-10">
        <div class="flex items-center justify-between mb-4">
            <label class="sr-only" use:melt={$label}>Protocol</label>
            <input
                    value={selectedToken}
                    name="protocol"
                    type="hidden"
            />
            <button
                    type="button"
                    class="flex h-10 w-[200px] items-center justify-between rounded-lg bg-white px-3 py-2
  text-gray-900 shadow transition-opacity hover:opacity-90"
                    use:melt={$trigger}
                    aria-label="protocol"
            >
                {$selectedLabel || 'Select a protocol'}
                <ChevronDown class="square-5" />
            </button>

            {#if $open}
                <div
                        class="z-10 flex max-h-[300px] flex-col
    overflow-y-auto rounded-lg bg-white p-1
    shadow focus:!ring-0"
                        use:melt={$menu}
                        transition:fade={{ duration: 150 }}
                >
                    {#each protocols as protocol}
                        <div
                                class="relative cursor-pointer rounded-lg py-1 px-4 text-gray-900
              focus:z-10
            data-[highlighted]:bg-gray-100 data-[selected]:bg-gray-100"
                                use:melt={$option({ value: protocol.token, label: protocol.name })}
                        >
                            {protocol.name}
                        </div>
                    {/each}
                </div>
            {/if}

            <a data-sveltekit-reload href={tryMeLink} class="text-sm font-semibold leading-6 text-white">Try me <span aria-hidden="true">→</span></a>
        </div>
        <label for="raw-tx" class="sr-only">Raw tx</label>
        <textarea
                bind:value={txRaw}
                rows="4"
                id="raw-tx"
                name="txRaw"
                type="text"
                required
                class="min-w-0 w-full mb-3 flex-auto rounded-md border-0 bg-gray-800 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white leading-6"
                placeholder="Enter raw transaction..."></textarea>

        {#if data.error}
            <p class="text-red-600 mb-3">{data.error}</p>
        {/if}

        <div class="flex items-center justify-center gap-4">
            <button
                    disabled={$navigating?.type === "goto"}
                    type="submit"
                    class="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:bg-gray-400"
            >
                Decode
            </button>
        </div>
    </form>
    {#if data.html}
        <div class="overflow-auto dark-mode my-6 bg-gray-800 rounded-md">
            <pre class="json-container bg-gray-800 p-2">{@html data.html}</pre>
        </div>
    {/if}
</div>