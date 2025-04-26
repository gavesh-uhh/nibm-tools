<script lang="ts">
  import { Pointer, Link, Star } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  interface Module {
    id: string;
    name: string;
    desc: string;
    linkTitle: string | null;
    linkUrl: string;
    hidden?: boolean;
  }

  const modules: Module[] = $state([
    {
      id: "lectures",
      name: "Lecture Explorer",
      desc: "Scroll through lectures up to three days without breaking your neck in the morning",
      linkTitle: "View Lectures",
      linkUrl: "/v1/lectures",
    },
    {
      id: "papers",
      name: "Past Paper Downloader",
      desc: "Find and download past papers at lightning speed... and in bulk. You're welcome.",
      linkTitle: "Grab Papers",
      linkUrl: "/v1/papers",
    },
    {
      id: "exams",
      name: "Exam Viewer",
      desc: "It's like the official exam viewer, but actually bearable to look at. And with extra stuff.",
      linkTitle: "View Exams",
      linkUrl: "/v1/exams",
    },
    {
      id: "questions",
      name: "Question Generator",
      desc: "Generate questions from past papers to test your knowledge with AI. It's like having a tutor, but free.",
      linkTitle: "",
      linkUrl: "#",
      hidden: true,
    },
  ]);

  let starredModules: string[] = $state([]);

  onMount(() => {
    const saved = localStorage.getItem("starred-modules");
    if (saved) {
      starredModules = JSON.parse(saved);
    }
  });

  function togglePin(moduleId: string) {
    if (starredModules.includes(moduleId)) {
      starredModules = starredModules.filter((id) => id !== moduleId);
    } else {
      starredModules = [...starredModules, moduleId];
    }
    localStorage.setItem("starred-modules", JSON.stringify(starredModules));
  }

  const sortedModules = $derived(
    [...modules].sort((a, b) => {
      const aIsPinned = starredModules.includes(a.id);
      const bIsPinned = starredModules.includes(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    }),
  );
</script>

<div class="flex-1 flex flex-col">
  <div class="flex flex-col items-center mt-8 mb-12">
    <h1 class="text-accent-foreground text-3xl sm:text-4xl font-semibold">
      NIBM Tools
    </h1>
    <p class="text-muted-foreground text-sm">Made by Gavesh ❤️</p>
    <Button
      href="https://www.buymeacoffee.com/gaveshsaparamadu"
      class="mt-2 bg-yellow-300 hover:bg-yellow-500 rounded-3xl"
      >🍻 Consider Donating</Button
    >
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 px-2 sm:px-8 w-full">
    {#each sortedModules as module}
      <div
        class="w-full flex flex-col justify-between rounded-lg ring-1 ring-border p-6 relative"
      >
        <div>
          <h1 class="text-2xl font-semibold">{module.name}</h1>
          <p class="text-muted-foreground mt-1">
            {module.desc}
          </p>
        </div>
        <div>
          <hr class="my-4" />
          <div class="flex flex-row justify-between items-center">
            {#if module.hidden}
              <Button disabled>
                <Pointer class="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            {:else}
              <Button href={module.linkUrl}>
                <Pointer class="w-4 h-4 mr-2" />
                {module.linkTitle ?? "Open"}
              </Button>
            {/if}
            <button
              class="p-1 rounded-full hover:bg-muted transition-colors"
              onclick={() => togglePin(module.id)}
              aria-label={starredModules.includes(module.id)
                ? "Unstar module"
                : "Star module"}
            >
              {#if starredModules.includes(module.id)}
                <Star class="w-5 h-5 text-yellow-500" />
              {:else}
                <Star class="w-5 h-5 text-muted-foreground" />
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="w-full flex items-center justify-center mt-6 gap-1">
    <a
      href="https://www.github.com/gavesh-uhh/nibm-tools"
      class="flex flex-row items-center gap-1 mt-2 bg-white/50 px-4 py-2 rounded-full text-black"
    >
      <Link class="w-4 h-4" />
      View Code
    </a>
    <a
      href="https://www.gavesh.live"
      class="flex flex-row items-center gap-1 mt-2 bg-white/50 px-4 py-2 rounded-full text-black"
    >
      <Link class="w-4 h-4" />
      Check My Website
    </a>
  </div>
</div>
