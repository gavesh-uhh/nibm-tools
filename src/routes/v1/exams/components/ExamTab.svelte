<script lang="ts">
  import { Sparkles, Pointer } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  const { exam }: { exam: Exam } = $props();
</script>

<div
  class="ring-1 flex flex-col items-center relative p-4 rounded-lg ring-muted bg-muted/25"
>
  <div class="flex flex-row items-center w-full">
    <div class="flex flex-col gap-1 flex-1">
      <div>
        <h1 class="text-xs text-muted-foreground">{exam.batch}</h1>
      </div>
      <div>
        <h1 class="text-1xl">{exam.title}</h1>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">{exam.date} @ {exam.time}</p>
      </div>
    </div>
    <div>
      <Button class="flex items-center" href={exam.url}>
        <Pointer class="w-4 h-4 mr-2" />
        Apply</Button
      >
    </div>
  </div>
  {#if exam.is_special}
    <div class="w-full">
      <hr class="my-2" />
      <h1 class="text-xs text-yellow-300 flex flex-row items-center">
        <Sparkles class="w-4 h-4 mr-2" />
        Special Exam
      </h1>
    </div>
  {/if}
</div>
