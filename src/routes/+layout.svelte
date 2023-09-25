<script lang="ts">
  import "../styles/app.css";

  import Footer from "$lib/components/Footer.svelte";
</script>

<div class="bg-gray-900 w-full flex flex-col min-h-screen relative isolate overflow-hidden">
  <div class="mx-auto max-w-4xl px-4 py-12 w-full">
    <slot />
  </div>

  <Footer />
</div>
