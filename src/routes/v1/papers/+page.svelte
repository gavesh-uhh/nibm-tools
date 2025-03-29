<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import PaperTab from "./components/PaperTab.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { Search, Loader2 } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";
  let searchBarInput: string = $state("");
  let keywordInput: string = $state("");
  let is_loading: boolean = $state(false);

  let papers: Paper[] = $state([]);
  let is_processing: boolean = $state(false);

  const mountPapers = async () => {
    is_loading = true;
    try {
      const res = await fetch("/api/papers?q=" + (searchBarInput || "Paper"));
      const data = await res.json();
      papers = data;
    } catch (error) {
      is_loading = false;
    }
    is_loading = false;
  };

  onMount(async () => {
    mountPapers();
  });

  const downloadAllPapers = async () => {
    is_processing = true;
    try {
      const downloadPromises = papers
        .filter((paper) => {
          if (
            keywordInput &&
            !paper.subject?.toLowerCase().includes(keywordInput.toLowerCase())
          ) {
            return false;
          }
          return paper.url ? true : false;
        })
        .map(async (paper) => {
          try {
            if (paper.url == null) return;
            const response = await fetch(paper.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = (paper.batch + " " + paper.subject + ".pdf").trim();
            link.click();
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error(`Error downloading paper "${paper.subject}":`, error);
          }
        });

      await Promise.all(downloadPromises);
    } catch (error) {
      console.error("Error in download process:", error);
    } finally {
      is_processing = false;
    }
  };
</script>

<div class="p-2 sm:p-8 flex flex-col gap-4">
  <div>
    <h1
      class="items-center justify-center text-2xl sm:text-3xl flex flex-row text-center text-muted-foreground"
    >
      <Search class="w-7 h-7 mr-2" />
      Paper Search
    </h1>
    <div class="flex flex-row w-full gap-2 mt-4">
      <Input
        oninput={mountPapers}
        class="text-sm w-full"
        bind:value={searchBarInput}
        placeholder="Search Subjects.. CN, SE, DM"
      ></Input>
    </div>
    <div class="w-full flex justify-end">
      <div class="w-full sm:max-w-[400px] mt-2 flex flex-row gap-2">
        <Input placeholder="Keyword.." bind:value={keywordInput}></Input>
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild let:builder>
            <Button
              size="icon"
              class="w-[50px]"
              variant="outline"
              builders={[builder]}>?</Button
            >
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title
                >Downloading Multiple Papers at Once</AlertDialog.Title
              >
              <AlertDialog.Description>
                You can download multiple papers at once using the Keyword
                feature.
                <hr class="my-4" />
                <ul class="flex flex-col items-start justify-start text-left">
                  <li>
                    <strong>Enter a Search Term</strong> – Type a keyword in the
                    search bar to find relevant subjects.
                  </li>
                  <li>
                    <strong>Use the Keyword Filter</strong> – Enter a keyword in
                    the <strong>Keyword</strong> input to filter papers by title.
                  </li>
                  <li>
                    <strong>Download Papers</strong> – Click the
                    <strong>Download All</strong> button to get all matching papers
                    (If keyword is empty, downloads all papers in the query).
                  </li>
                  <li></li>
                </ul>
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Gotcha</AlertDialog.Cancel>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
        <Button disabled={is_processing} onclick={downloadAllPapers}>
          {#if is_processing}
            <Loader2 class="w-5 h-5 mr-2 animate-spin" /> Processing
          {:else}
            Download All
          {/if}
        </Button>
      </div>
    </div>
  </div>
  {#if is_loading}
    <div class="h-full flex items-center justify-center p-8 opacity-75">
      <div class="flex flex-row gap-2 items-center">
        <Loader2 class="w-5 h-5 animate-spin" />
        <h1 class="">Loading Papers ...</h1>
      </div>
    </div>
  {:else}
    <div class="grid gap-8 w-full">
      {#each papers as item}
        <PaperTab paper={item} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    justify-content: center;
    align-content: center;
    width: 100%;
    margin: 0 auto;
  }
</style>
