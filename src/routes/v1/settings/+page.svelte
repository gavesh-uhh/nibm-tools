<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import * as Select from "$lib/components/ui/select";
  import Alert from "$lib/components/ui/alert/alert.svelte";
  import { onMount } from "svelte";

  let userSettings = {
    batch: "",
    index: "",
    fullBatch: undefined as string | undefined,
  };

  let selectedBranch: { value: string } | undefined = undefined;
  let showSuccess = false;

  onMount(() => {
    const saved = localStorage.getItem("user-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userSettings = {
          batch: parsed.batch || "",
          index: parsed.index || "",
          fullBatch: parsed.fullBatch || undefined,
        };
        selectedBranch = parsed.fullBatch ? { value: parsed.fullBatch } : undefined;
      } catch {}
    }
  });

  $: if (userSettings.fullBatch !== selectedBranch?.value) {
    selectedBranch = userSettings.fullBatch ? { value: userSettings.fullBatch } : undefined;
  }

  function saveSettings() {
    localStorage.setItem(
      "user-settings",
      JSON.stringify({
        batch: userSettings.batch,
        index: userSettings.index,
        fullBatch: selectedBranch?.value,
      })
    );
    userSettings.fullBatch = selectedBranch?.value;
    showSuccess = true;
    setTimeout(() => (showSuccess = false), 2000);
  }
</script>

<div class="max-w-md mx-auto p-4 flex flex-col gap-4 bg-background rounded-xl shadow-lg mt-8 relative">
  {#if showSuccess}
    <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none">
      <Alert class="mb-2 w-fit pointer-events-auto">Saved Successfully!</Alert>
    </div>
  {/if}
  <div class="flex gap-2 items-center mb-1">
    <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
  </div>
  <div class="flex flex-col gap-1">
    <h1 class="text-muted-foreground mb-1 text-sm font-medium">Your Batch</h1>
    <Input placeholder="DSE24.2F" bind:value={userSettings.batch} class="h-9 text-base px-3" />
  </div>
  <div class="flex flex-col gap-1">
    <h1 class="text-muted-foreground mb-1 text-sm font-medium">Your Personal Index</h1>
    <Input placeholder="Ex:- CODSE19.1F-XXX" bind:value={userSettings.index} class="h-9 text-base px-3" />
  </div>
  <div class="flex flex-col gap-1">
    <h1 class="text-muted-foreground mb-1 text-sm font-medium">Your Branch</h1>
    <Select.Root
      selected={selectedBranch}
      onSelectedChange={(selected) => {
        selectedBranch = selected;
        userSettings.fullBatch = selected?.value;
      }}
    >
      <Select.Trigger class="w-full h-9 text-base px-3 border rounded-md bg-muted focus:ring-2 focus:ring-blue-500 transition-all">
        <Select.Value placeholder="Select Branch" />
      </Select.Trigger>
      <Select.Content class="w-full">
        <Select.Item value="CO" label="School of Computing">School of Computing</Select.Item>
        <Select.Item value="NIC" label="National Innovation Center">National Innovation Center</Select.Item>
        <Select.Item value="RJ" label="School of Business">School of Business</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>
  <div class="flex justify-end mt-4">
    <Button onclick={saveSettings} class="px-5 py-2 text-base rounded-md">Save Settings</Button>
  </div>
</div>
