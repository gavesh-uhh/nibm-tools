<script lang="ts">
  import ExamTab from "./components/ExamTab.svelte";
  import { Search, Loader2 } from "lucide-svelte";
  import { getDay, getRandomQuote } from "$lib/nibm";
  import { onMount } from "svelte";
  import Input from "$lib/components/ui/input/input.svelte";

  let loading = $state(false);
  let searchBarInput: string = $state("");
  let examSearchResults: Exam[] = $state([]);

  let query = $derived(searchBarInput.toLowerCase());

  let filteredExams = $derived(
    examSearchResults.filter((exam: Exam) => {
      if (!searchBarInput) return true;
      if (!exam) return false;
      return (
        exam.title?.toLowerCase().startsWith(query) ||
        exam.batch?.toLowerCase().startsWith(query) ||
        exam.date?.toLowerCase().startsWith(query) ||
        exam.time?.toLowerCase().startsWith(query)
      );
    }),
  );

  onMount(async () => {
    loading = true;
    const res = await fetch("/api/exams");
    const data = await res.json();
    examSearchResults = data;
    loading = false;
  });
</script>

<div class="p-2 sm:p-8 flex flex-col gap-4 flex-1">
  <div>
    <h1
      class="items-center justify-center text-2xl sm:text-3xl flex flex-row text-center text-muted-foreground"
    >
      <Search class="w-7 h-7 mr-2" />
      Exams Crawler
    </h1>
    <div class="flex flex-row w-full gap-2 mt-4">
      <Input
        class="text-sm w-full"
        bind:value={searchBarInput}
        placeholder="Search Exams.. "
      />
    </div>
  </div>
  {#if loading}
    <div class="mt-10 flex items-center flex-col gap-2">
      <Loader2 class="w-5 h-5 animate-spin opacity-60" />
      <h1 class="text-xs mt-3 max-w-[250px] text-center text-muted-foreground">
        {getRandomQuote()}
      </h1>
    </div>
  {:else}
    <div class="flex flex-col gap-2 w-full">
      {#if filteredExams.length === 0}
        <div class="text-center text-xs text-muted-foreground mt-4">
          No results found for "{searchBarInput}"
        </div>
      {:else}
        {#each filteredExams as exam}
          <ExamTab {exam} />
        {/each}
      {/if}
    </div>
  {/if}
</div>
