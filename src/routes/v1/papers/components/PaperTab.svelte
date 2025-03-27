<script lang="ts">
  let { paper }: { paper: Paper } = $props();
  import { Download } from "lucide-svelte";
  const handleDownload = async () => {
    try {
      if (!paper.url) return;
      const response = await fetch(paper.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = paper.title + ".pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };
</script>

<div class="paper-container">
  <div
    class="h-full ring-1 p-4 rounded-lg ring-muted bg-muted/25 w-full flex flex-col justify-between gap-2 max-w-none"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center w-full">
        <img
          loading="eager"
          src={paper.thumbnail}
          class="rounded-sm w-full h-48 sm:h-64 object-cover object-top opacity-75 hover:opacity-100 transition duration-200"
          alt=""
        />
      </div>
      <div class="flex flex-col items-left w-full">
        <h1 class="text-xs text-muted-foreground">{paper.subject}</h1>
        <h1 class="text-sm sm:text-base m-0">{paper.batch}</h1>
      </div>
    </div>
    <div class="flex items-center w-full mt-4 gap-2">
      <a
        href={paper.url}
        target="_blank"
        class="view-button text-center p-2 w-full text-xs sm:text-sm md:text-base m-0"
        >View</a
      >
      <button
        onclick={handleDownload}
        class="download-button flex items-center justify-center h-full px-2 text-xs sm:text-sm md:text-base m-0"
        title="Download"
      >
        <Download class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>

<style>
  .paper-container {
    width: 100%;
    max-width: 450px;
  }
  .view-button,
  .download-button {
    background: linear-gradient(
      135deg,
      var(--paper-view-grad, #2e2e2e9f),
      #121212
    );
    color: #f9f9f9;
    border: 1px solid #333;
    border-radius: 0.35rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    transition: --paper-view-grad 300ms linear;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .view-button:hover,
  .download-button:hover {
    background: linear-gradient(135deg, #2e2e2eff, #121212);
  }
  .download-button {
    width: 3rem;
    cursor: pointer;
    background: linear-gradient(
      135deg,
      var(--paper-download-grad, #3e3e3e9f),
      #121212
    );
  }
  .download-button:hover {
    background: linear-gradient(135deg, #3e3e3eff, #121212);
  }
  img {
    border-radius: 0.5rem;
  }
</style>
