<script lang="ts">
  import { Link, Star, ExternalLink, Loader2 } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
    import { getRandomQuote } from "$lib/nibm";

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

  function getDeviceType(): "android" | "iphone" | "desktop" {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      return "android";
    }
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return "iphone";
    }
    return "desktop";
  }

  function getInstallText(): string {
    const device = getDeviceType();
    if (device === "android") {
      return "Install on Android";
    } else if (device === "iphone") {
      return "Install on IOS";
    } else {
      return "Install App";
    }
  }

  let starredModules: string[] = $state([]);
  let showInstallGuide = $state(false);
  let showContent = $state(false);

  onMount(() => {
    const saved = localStorage.getItem("starred-modules");
    if (saved) {
      starredModules = JSON.parse(saved);
    }

    const preloadLectures = async () => {
      try {
        await fetch("/v1/lectures");
        console.log("Lectures page preloaded");
      } catch (error) {
        console.log("Preload failed:", error);
      }
    };

    setTimeout(preloadLectures, 1000);
    setTimeout(() => {
      showContent = true;
    }, 1000);
  });

  function togglePin(moduleId: string) {
    if (starredModules.includes(moduleId)) {
      starredModules = starredModules.filter((id) => id !== moduleId);
    } else {
      starredModules = [...starredModules, moduleId];
    }
    localStorage.setItem("starred-modules", JSON.stringify(starredModules));
  }

  function showInstallInstructions() {
    showInstallGuide = true;
  }

  function getInstallSteps(): string[] {
    const device = getDeviceType();
    if (device === "android") {
      return [
        "1. Tap the menu button (⋮) in your browser",
        "2. Select 'Add to Home screen' or 'Install app'",
        "3. Tap 'Add' to confirm",
        "4. The app will now appear on your home screen!",
      ];
    } else if (device === "iphone") {
      return [
        "1. Tap the Share button (📤) in Safari",
        "2. Scroll down and tap 'Add to Home Screen'",
        "3. Tap 'Add' to confirm",
        "4. The app will now appear on your home screen!",
      ];
    } else {
      return [
        "1. Click the install icon in your browser's address bar",
        "2. Or use the browser menu to install the app",
        "3. Follow the browser's installation prompts",
        "4. The app will be installed on your device!",
      ];
    }
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

{#if !showContent}
  <div
    class="fixed inset-0 bg-background z-50 flex items-center flex-col justify-center"
  >
    <div class="flex flex-col items-center gap-5">
      <div class="animation-spin opacity-50">
        <Loader2 class="animation-spin w-10 h-10" />
      </div>
      <h1 class="text-sm w-[300px] text-foreground opacity-50 text-center">{getRandomQuote()}</h1>
    </div>
  </div>
{/if}

<div
  class="flex-1 flex flex-col"
  class:opacity-0={!showContent}
  class:animate-fade-in={showContent}
>
  <div class="flex flex-col items-center py-8 text-center md:py-12">
    <h1 class="font-bold tracking-tight text-5xl">NIBM Toolkit</h1>
    <div class="mt-6 flex flex-col justify-center gap-4">
      {#if getDeviceType() == "android" || getDeviceType() == "iphone"}
        <Button
          size="lg"
          class="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          onclick={showInstallInstructions}
        >
          {#if getDeviceType() === "android"}
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.523 15.3414c-.5511 0-.9993-.4486-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2432 13.8533 7.4287 11.9797 7.4287c-1.8736 0-3.6105.8145-4.8057 2.1708L5.1517 6.0962a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676L6.4297 9.3214C4.9447 10.6934 4 12.5747 4 14.6503c0 3.7666 3.1338 6.8503 6.9003 6.8503 3.7666 0 6.9003-3.0837 6.9003-6.8503 0-2.0756-.9447-3.9569-2.4195-5.3289M13.9797 20.5003c-3.0385 0-5.5003-2.4618-5.5003-5.5003 0-1.7869.8518-3.3735 2.1797-4.3716l1.3643 2.3643a.416.416 0 00.5676.1521.416.416 0 00.1521-.5676l-1.3643-2.3643c.6655-.2393 1.3789-.3716 2.1119-.3716.733 0 1.4464.1323 2.1119.3716l-1.3643 2.3643a.416.416 0 00.1521.5676.416.416 0 00.5676-.1521l1.3643-2.3643c1.3279.9981 2.1797 2.5847 2.1797 4.3716 0 3.0385-2.4618 5.5003-5.5003 5.5003"
              />
            </svg>
            {getInstallText()}
          {:else if getDeviceType() === "iphone"}
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            {getInstallText()}
          {/if}
        </Button>
      {/if}
      <Button
        href="https://www.buymeacoffee.com/gaveshsaparamadu"
        size="lg"
        class="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >🍻 Support the Project</Button
      >
    </div>
    <p class="mt-4 text-xs text-muted-foreground">
      Developed with ❤️ by Gavesh
    </p>
  </div>

  <div id="modules" class="grid grid-cols-1 gap-4 px-2 sm:px-8 md:grid-cols-2">
    {#each sortedModules as module}
      <div
        class="w-full flex flex-col justify-between rounded-xl ring-1 ring-border p-4 sm:p-6 relative"
      >
        <div>
          <h1 class="text-xl sm:text-2xl font-semibold">{module.name}</h1>
          <p class="text-muted-foreground mt-2 text-sm sm:text-base">
            {module.desc}
          </p>
        </div>
        <div>
          <hr class="my-4" />
          <div
            class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center"
          >
            {#if module.hidden}
              <Button disabled class="w-full sm:w-auto">
                <ExternalLink class="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            {:else}
              <Button
                href={module.linkUrl}
                class="w-full sm:w-auto"
                onmouseenter={() => {
                  if (module.id === "lectures") {
                    fetch("/v1/lectures").catch(() => {});
                  }
                }}
              >
                <ExternalLink class="w-4 h-4 mr-2" />
                {module.linkTitle ?? "Open"}
              </Button>
            {/if}
            <button
              class="p-3 rounded-full hover:bg-muted transition-colors self-end sm:self-auto"
              onclick={() => togglePin(module.id)}
              aria-label={starredModules.includes(module.id)
                ? "Unstar module"
                : "Star module"}
            >
              {#if starredModules.includes(module.id)}
                <Star class="w-6 h-6 text-yellow-500" />
              {:else}
                <Star class="w-6 h-6 text-muted-foreground" />
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <footer class="mt-16 flex w-full items-center justify-center pb-8">
    <div class="flex items-center space-x-4">
      <a
        href="https://www.github.com/gavesh-uhh/nibm-tools"
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="View source code on GitHub"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6"
          ><path
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35.0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35.0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
          /><path d="M9 18c-4.51 2-5-2-7-2" /></svg
        >
      </a>
      <a
        href="https://www.gavesh.live"
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Visit Gavesh's personal website"
      >
        <Link class="h-6 w-6" />
      </a>
    </div>
  </footer>
</div>

{#if showInstallGuide}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-background rounded-lg p-6 max-w-md w-full shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Installing NIBM Tools</h2>
        <button
          onclick={() => (showInstallGuide = false)}
          class="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3">
        {#each getInstallSteps() as step}
          <p class="text-sm text-muted-foreground">{step}</p>
        {/each}
      </div>

      <div class="mt-6 flex justify-end">
        <Button
          onclick={() => (showInstallGuide = false)}
          class="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Gotcha!
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>

  .animation-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes text-appear {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
</style>
