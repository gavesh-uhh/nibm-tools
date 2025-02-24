<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { ArrowLeft } from "lucide-svelte";
  let { children } = $props();
</script>

<div class="flex flex-col flex-1">
  <div class="">
    <div class="flex gap-3 w-fit items-center">
      <Button href="/" variant="outline" size="icon" class="rounded-full">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <span class="hidden sm:block">Back</span>
    </div>
  </div>
  <div class="mt-2 flex-1">
    {@render children()}
  </div>
</div>
