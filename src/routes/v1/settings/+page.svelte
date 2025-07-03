<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";

  import { onMount } from "svelte";

  let batch = "";
  let index = "";

  onMount(() => {
    const savedBatch = localStorage.getItem("user-batch");
    const savedIndex = localStorage.getItem("user-index");
    if (savedBatch) batch = savedBatch;
    if (savedIndex) index = savedIndex;
  });

  function saveSettings() {
    localStorage.setItem("user-batch", batch);
    localStorage.setItem("user-index", index);
  }
</script>

<div class="p-2 flex flex-col gap-2">
  <div class="flex gap-3 w-fit items-center mb-4">
    <h1 class="text-4xl font-semibold">Settings</h1>
  </div>
  <div>
    <h1 class="text-muted-foreground mb-1">Your Batch</h1>
    <Input placeholder="DSE24.2F" bind:value={batch}></Input>
  </div>
  <div>
    <h1 class="text-muted-foreground mb-1">Your Personal Index</h1>
    <Input placeholder="Ex:- CODSE19.1F-XXX" bind:value={index}></Input>
  </div>
  <div class="flex justify-end mt-4">
    <Button onclick={saveSettings}>Save Settings</Button>
  </div>
</div>
