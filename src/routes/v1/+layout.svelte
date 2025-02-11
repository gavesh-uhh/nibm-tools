<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { ArrowLeft } from "lucide-svelte";
  let { children } = $props();
</script>

<div class="flex flex-col flex-1">
  <div class="">
    <Button href="/" variant="outline">
      <ArrowLeft class="w-4 h-4 mr-2" />
      Home
    </Button>
  </div>
  <div class="mt-2 flex-1">
    {@render children()}
  </div>
</div>
