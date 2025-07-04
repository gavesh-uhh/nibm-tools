<script lang="ts">
  import { getRandomQuote } from "$lib/nibm";
  import "../app.css";
  let showContent = $state(false);
  let { children } = $props();
  import { onMount } from "svelte";
  import { Loader2 } from "lucide-svelte";

  onMount(() => {
    setTimeout(() => {
      showContent = true;
    }, 1000);
  });
</script>

<head>
  <title>NIBM Tools</title>
</head>

{#if !showContent || (showContent == undefined && !children)}
  <div
    class="fixed inset-0 bg-background z-50 flex items-center flex-col justify-center"
  >
    <div class="flex flex-col items-center gap-5">
      <div class="animation-spin opacity-50">
        <Loader2 class="animation-spin w-10 h-10" />
      </div>
      <h1 class="text-sm w-[300px] text-foreground opacity-50 text-center">
        {getRandomQuote()}
      </h1>
    </div>
  </div>
{/if}


<div
  class="p-4 flex flex-col min-h-screen"
  class:opacity-0={!showContent}
>
  {@render children()}
</div>

<style>
  .animation-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes text-appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

</style>

