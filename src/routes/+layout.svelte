<script lang="ts">
  import "../styles/app.css";
  import Footer from "$lib/components/Footer.svelte";
</script>

<div class="max-w-4xl mx-auto w-full p-4 flex flex-col min-h-screen">
    <slot />
    <Footer />
</div>
