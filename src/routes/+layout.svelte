<script lang="ts">
  import "../styles/app.css";
  import Footer from "$lib/components/Footer.svelte";

  // @ts-ignore
  BigInt.prototype.toJSON = function() { return this.toString() }
</script>

<div class="bg-gray-900 w-full flex flex-col min-h-screen relative isolate overflow-hidden">
    <div class="mx-auto max-w-4xl px-4 py-12 w-full">
        <slot />
    </div>
    <Footer />
    <svg viewBox="0 0 1024 1024" class="absolute left-1/2 bottom-[-32rem] -z-10 h-[64rem] w-[64rem] -translate-x-1/2" aria-hidden="true">
        <circle cx="512" cy="512" r="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fill-opacity="0.7" />
        <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 512) rotate(90) scale(512)">
                <stop stop-color="#7775D6" />
                <stop offset="1" stop-color="#E935C1" stop-opacity="0" />
            </radialGradient>
        </defs>
    </svg>
</div>
