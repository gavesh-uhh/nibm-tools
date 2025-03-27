<script lang="ts">
  import { Pointer, Link } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
</script>

{#snippet module(
  name: string,
  desc: string,
  linkTitle: string | null,
  linkUrl: string,
  hidden?: boolean,
)}
  <div class="max-w-[500px] rounded-lg ring-1 ring-border p-6">
    <h1 class="text-2xl font-semibold">{name}</h1>
    <p class="text-muted-foreground mt-1">
      {desc}
    </p>
    <hr class="my-4" />
    {#if hidden}
      <!-- content here -->
      <Button disabled>
        <Pointer class="w-4 h-4 mr-2" />
        Coming Soon
      </Button>
    {:else}
      <Button href={linkUrl}>
        <Pointer class="w-4 h-4 mr-2" />
        {linkTitle ?? "Open"}
      </Button>
    {/if}
  </div>
{/snippet}

<div class="flex-1 flex flex-col">
  <div class="flex flex-col items-center mt-6 mb-6">
    <h1 class="text-accent-foreground text-3xl sm:text-4xl font-semibold">
      NIBM Tools
    </h1>
    <p class="text-muted-foreground text-sm">Made by Gavesh ❤️</p>
  </div>

  <div
    class="flex flex-col sm:flex-row flex-wrap gap-2 justify-center items-center mt-2"
  >
    {@render module(
      "Lecture Explorer",
      "Scroll through lectures up to three days without breaking your neck in the morning",
      "View Lectures",
      "/v1/lectures",
    )}

    {@render module(
      "Past Paper Downloader",
      "Find and download past papers at lightning speed... and in bulk. You’re welcome.",
      "Grab Papers",
      "/v1/papers",
    )}

    {@render module(
      "Exam Viewer",
      "It’s like the official exam viewer, but actually bearable to look at. And with extra stuff.",
      "View Exams",
      "/v1/exams",
    )}

    {@render module(
      "Question Generator",
      "Generate questions from past papers to test your knowledge with AI. It’s like having a tutor, but free.",
      "",
      "#",
      true,
    )}
  </div>

  <div class="w-full flex items-center justify-center mt-6">
    <a
      href="https://www.github.com/gavesh-uhh/nibm-tools"
      class="underline underline-offset-2 flex flex-row items-center gap-1 mt-2"
    >
      <Link class="w-4 h-4" />
      View Code
    </a>
  </div>
  <div class="w-full flex items-center justify-center">
    <a
      href="https://www.gavesh.live"
      class="underline underline-offset-2 flex flex-row items-center gap-1 mt-2"
    >
      <Link class="w-4 h-4" />
      Check My Website
    </a>
  </div>
</div>
