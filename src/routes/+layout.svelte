<script lang="ts">
  import { getRandomQuote } from "$lib/nibm";
  import "../app.css";
  let showContent = $state(false);
  let { children } = $props();
  import { onMount } from "svelte";
  import { Loader2, Loader, WifiOff } from "lucide-svelte";

  let isOnline = $state(navigator.onLine);

  onMount(() => {
    const handleOnline = () => {
      isOnline = true;
    };

    const handleOffline = () => {
      isOnline = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setTimeout(() => {
      showContent = true;
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

<head>
  <title>NIBM Toolkit</title>
</head>

{#if !showContent || (showContent == undefined && !children)}
  <div
    class="fixed inset-0 bg-background z-50 flex items-center flex-col justify-center"
  >
    <div class="flex flex-col items-center gap-3">
      <div class="animation-spin opacity-50">
        <Loader2 class="animate-spin w-10 h-10" />
      </div>
      <h1 class="text-sm w-[300px] text-foreground opacity-50 text-center">
        {getRandomQuote()}
      </h1>
    </div>
  </div>
{/if}

{#if !showContent}
  <div class="fixed top-0 left-0 right-0 bg-gray-500 text-gray-900 py-2 text-center z-50 flex items-center justify-center gap-2">
    <Loader class="w-4 h-4 animate-spin" />
  </div>
{:else if !isOnline}
  <div class="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 text-center z-50 flex items-center justify-center gap-2">
    <WifiOff class="w-4 h-4" />
    <span class="text-xs sm:text-sm font-medium">Offline or slow network. Some features may not work.</span>
  </div>
{/if}

<div class="p-4 flex flex-col min-h-screen" class:opacity-0={!showContent}>
  {@render children()}
</div>

<style>
  @keyframes text-appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
