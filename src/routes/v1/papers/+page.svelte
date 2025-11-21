<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import PaperTab from "./components/PaperTab.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    Search,
    Loader2,
    Download,
    Archive,
    RefreshCcw,
    Info,
  } from "lucide-svelte";
  import JSZip from "jszip";
  import { onMount } from "svelte";

  let searchBarInput: string = $state("");
  let keywordInput: string = $state("");
  let is_loading: boolean = $state(false);
  let papers: Paper[] = $state([]);
  let is_processing: boolean = $state(false);
  let downloadStatus: string = $state("");
  let errorMessage: string | null = $state(null);
  let infoMessage: string | null = $state(null);
  let lastUpdated: string | null = $state(null);
  let progressLabel: string = $state("");
  let progressPercent: number = $state(0);
  let searchDebounce: ReturnType<typeof setTimeout> | undefined = undefined;

  const getQuery = () => encodeURIComponent(searchBarInput.trim() || "Paper");

  const mountPapers = async () => {
    is_loading = true;
    errorMessage = null;
    infoMessage = "Searching the library...";
    try {
      const res = await fetch("/api/papers?q=" + getQuery());
      if (!res.ok) throw new Error("Failed to fetch papers");
      const data = (await res.json()) as Paper[];
      papers = data;
      lastUpdated = new Date().toLocaleTimeString();
      infoMessage =
        data.length === 0
          ? "No papers matched your search."
          : `Loaded ${data.length} paper${data.length === 1 ? "" : "s"}.`;
    } catch (error) {
      console.error("Failed to load papers:", error);
      errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching papers.";
      infoMessage = null;
    } finally {
      is_loading = false;
    }
  };

  const handleSearchInput = (value: string) => {
    searchBarInput = value;
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    searchDebounce = setTimeout(() => {
      mountPapers();
    }, 400);
  };

  onMount(async () => {
    mountPapers();
  });

  const downloadAllPapers = async (mode: "zip" | "individual" = "zip") => {
    const papersToDownload = papers.filter((paper) => {
      if (
        keywordInput &&
        !paper.subject?.toLowerCase().includes(keywordInput.toLowerCase())
      ) {
        return false;
      }
      return Boolean(paper.url);
    });

    if (papersToDownload.length === 0) {
      downloadStatus = "Nothing to download for the current filters.";
      return;
    }

    is_processing = true;
    downloadStatus =
      mode === "zip"
        ? "Bundling PDFs into a single zip..."
        : "Preparing parallel downloads...";
    progressLabel = "";
    progressPercent = 0;

    try {
      if (mode === "zip") {
        await downloadAsZip(papersToDownload);
      } else {
        await downloadIndividually(papersToDownload);
      }
      downloadStatus =
        mode === "zip"
          ? `Created zip with ${papersToDownload.length} paper${
              papersToDownload.length === 1 ? "" : "s"
            }.`
          : `Triggered ${papersToDownload.length} individual download${
              papersToDownload.length === 1 ? "" : "s"
            }.`;
    } catch (error) {
      console.error("Error in download process:", error);
      downloadStatus =
        error instanceof Error
          ? error.message
          : "Failed to download papers. Please try again.";
    } finally {
      is_processing = false;
    }
  };

  const downloadAsZip = async (papersToDownload: Paper[]) => {
    const zip = new JSZip();

    for (let i = 0; i < papersToDownload.length; i++) {
      const paper = papersToDownload[i];
      if (!paper.url) continue;

      progressLabel = `(${i + 1}/${papersToDownload.length}) ${paper.subject ?? paper.title ?? "Paper"}`;
      const response = await fetch(paper.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${paper.subject ?? "paper"}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const safeName = sanitizeFilename(
        `${paper.batch ?? "Batch"} - ${
          paper.subject ?? paper.title ?? "Paper"
        }`.trim(),
      );
      zip.file(`${safeName}.pdf`, arrayBuffer);
      progressPercent = Math.round(((i + 1) / papersToDownload.length) * 50);
    }

    const blob = await zip.generateAsync(
      { type: "blob" },
      (metadata) => (progressPercent = 50 + Math.round(metadata.percent / 2)),
    );

    const zipName = `nibm-papers-${new Date()
      .toISOString()
      .split("T")[0]}.zip`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName;
    link.click();
    window.URL.revokeObjectURL(url);
    progressPercent = 100;
  };

  const downloadIndividually = async (papersToDownload: Paper[]) => {
    const BATCH_SIZE = 3;
    const DELAY_BETWEEN_BATCHES = 750;

    for (let i = 0; i < papersToDownload.length; i += BATCH_SIZE) {
      const batch = papersToDownload.slice(i, i + BATCH_SIZE);
      progressLabel = `Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
        papersToDownload.length / BATCH_SIZE,
      )}`;

      const batchPromises = batch.map(async (paper, index) => {
        if (!paper.url) return;

        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const response = await fetch(paper.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${paper.subject}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          sanitizeFilename(
            `${paper.batch ?? ""} ${paper.subject ?? paper.title ?? "Paper"}`,
          ) + ".pdf";
        link.click();
        window.URL.revokeObjectURL(url);
      });

      await Promise.all(batchPromises);
      if (i + BATCH_SIZE < papersToDownload.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES),
        );
      }

      progressPercent = Math.round(
        ((i + batch.length) / papersToDownload.length) * 100,
      );
    }
  };

  const sanitizeFilename = (name: string) =>
    name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, " ")
      .trim() || "paper";
</script>

<div class="p-2 sm:p-8 flex flex-col gap-4">
  <div>
    <h1
      class="items-center justify-center text-2xl sm:text-3xl flex flex-row text-center text-muted-foreground"
    >
      <Search class="w-7 h-7 mr-2" />
      Paper Search
    </h1>
      <div class="flex flex-col gap-3 mt-4">
        <div class="flex flex-row gap-2 flex-wrap items-center">
        <Input
            class="text-sm flex-1 min-w-[200px]"
          bind:value={searchBarInput}
          placeholder="Search subjects… CN, SE, DM"
          on:input={(event) =>
            handleSearchInput((event.target as HTMLInputElement).value)}
        />
        <Button
          variant="secondary"
            class="flex items-center justify-center gap-2 p-2 h-11 rounded-full"
          onclick={() => mountPapers()}
          size="icon"
          disabled={is_loading}
        >
          <RefreshCcw class="w-4 h-4" />
        </Button>
      </div>
      {#if infoMessage || lastUpdated}
        <p class="text-xs text-muted-foreground">
          {infoMessage}
          {#if lastUpdated}
            <span class="opacity-70"> (updated {lastUpdated})</span>
          {/if}
        </p>
      {/if}
      {#if errorMessage}
        <p class="text-xs text-destructive">{errorMessage}</p>
      {/if}
      <div class="tool-panel">
        <div class="tool-row">
          <Input
            placeholder="Optional keyword filter"
            bind:value={keywordInput}
            class="flex-1"
          />
        </div>
        <div class="tool-actions">
          <Button
            class="primary-action"
            disabled={is_processing}
            onclick={() => downloadAllPapers("zip")}
          >
            {#if is_processing}
              <Loader2 class="w-4 h-4 animate-spin" />
              {progressPercent > 0 ? `${progressPercent}%` : "Working"}
            {:else}
              <Archive class="w-4 h-4 mr-2" />
              Bundle ZIP
            {/if}
          </Button>
          <Button
            variant="outline"
            class="secondary-action"
            disabled={is_processing}
            onclick={() => downloadAllPapers("individual")}
          >
            <Download class="w-4 h-4 mr-2" />
            Multi-download
          </Button>
        </div>
        {#if is_processing}
          <div class="flex flex-col gap-1">
            <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full bg-primary transition-all"
                style={`width: ${progressPercent}%`}
              ></div>
            </div>
            {#if progressLabel}
              <p class="text-[11px] text-muted-foreground">{progressLabel}</p>
            {/if}
          </div>
        {/if}
        {#if downloadStatus}
          <p class="text-xs text-muted-foreground">{downloadStatus}</p>
        {/if}
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

  .tool-panel {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    border-radius: 1rem;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--muted) / 0.35);
    padding: 1.25rem;
    backdrop-filter: blur(8px);
  }

  .tool-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tool-actions {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
    height: 3rem;
    border-radius: 999px;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .tool-help {
    gap: 0.4rem;
  }

  @media (min-width: 640px) {
    .tool-row {
      flex-direction: row;
      align-items: center;
    }

    .tool-actions {
      flex-direction: row;
    }

    .primary-action,
    .secondary-action {
      min-width: 0;
    }

    .tool-help {
      width: auto;
    }
  }
</style>
