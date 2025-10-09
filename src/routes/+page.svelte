<script lang="ts">
  import {
    Clock,
    MapPin,
    Download,
    Link,
    Star,
    ExternalLink,
    Github,
    Loader,
    Settings,
  } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";
  import * as Alert from "$lib/components/ui/alert/index";
  import { fade } from "svelte/transition";

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

  let isRefreshing = $state(false);
  let pullStartY = 0;
  let pullDistance = 0;
  let isPulling = false;

  function triggerHapticFeedback() {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  function getDeviceType(): string {
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

  let nextLecture: Lecture | undefined = $state(undefined);
  let starredModules: string[] = $state([]);
  let showInstallGuide = $state(false);
  let isCheckingLecture = $state(false);
  let userSettings: { batch?: string; fullBatch?: string } = $state({});
  let showNoLectures = $state(false);

  const convertLecToUnitMinutes = async (timeString: string) => {
    const splittedString = timeString.split(":");
    const hours = parseInt(splittedString[0]) * 60;
    const mins = parseInt(splittedString[1]);
    return hours + mins;
  };

  const getPendingLectures = async () => {
    try {
      if (localStorage.getItem("user-settings") == null) return;
      isCheckingLecture = true;
      userSettings = JSON.parse(localStorage.getItem("user-settings") ?? "{}");
      const userBatch = userSettings.batch;
      const userBranch = userSettings.fullBatch;
      const currentDate = new Date();
      const dayString =
        currentDate.getFullYear() +
        "-" +
        (currentDate.getMonth() + 1) +
        "-" +
        currentDate.getDate();

      const params = new URLSearchParams({
        date: dayString,
        batch: userBatch ?? '',
        limit: '1',
        branch: userBranch ?? ''
      });
      const response = await fetch(`/api/lectures?${params.toString()}`);
      const data = await response.json();
      let found = false;
      for (const lec of data) {
        if (lec.time.start == null || lec.time.end == null) continue;
        const currentTime =
          currentDate.getHours() * 60 + currentDate.getMinutes();
        const lecStartTime = await convertLecToUnitMinutes(lec.time.start);
        if (currentTime < lecStartTime) {
          nextLecture = lec;
          found = true;
          break;
        }
      }
      isCheckingLecture = false;
      if (!found) {
        nextLecture = undefined;
        showNoLectures = true;
        setTimeout(() => (showNoLectures = false), 2500);
      }
    } catch (err) {
      isCheckingLecture = false;
      console.log("Pending Failed :- " + (err as Error).message);
    }
  };

  function handleTouchStart(event: TouchEvent) {
    if (window.scrollY === 0) {
      pullStartY = event.touches[0].clientY;
      isPulling = true;
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isPulling) return;

    pullDistance = event.touches[0].clientY - pullStartY;

    if (pullDistance > 0 && window.scrollY === 0) {
      event.preventDefault();
      document.body.style.transform = `translateY(${Math.min(pullDistance * 0.5, 100)}px)`;
    }
  }

  function handleTouchEnd() {
    if (!isPulling) return;

    isPulling = false;
    document.body.style.transform = "";

    if (pullDistance > 100) {
      // Trigger refresh
      refreshData();
    }

    pullDistance = 0;
  }

  async function refreshData() {
    isRefreshing = true;
    try {
      await getPendingLectures();
    } finally {
      isRefreshing = false;
    }
  }

  onMount(() => {
    const saved = localStorage.getItem("starred-modules");
    if (saved) {
      starredModules = JSON.parse(saved);
    }

    const savedSettings = localStorage.getItem("user-settings");
    if (savedSettings) {
      userSettings = JSON.parse(savedSettings);
    }

    const preloadLectures = async () => {
      try {
        await fetch("/v1/lectures");
        console.log("Lectures page preloaded");
      } catch (error) {
        console.log("Preload failed:", error);
      }
    };

    getPendingLectures();
    setTimeout(preloadLectures, 1000);

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  });

  function togglePin(moduleId: string) {
    triggerHapticFeedback();
    if (starredModules.includes(moduleId)) {
      starredModules = starredModules.filter((id) => id !== moduleId);
    } else {
      starredModules = [...starredModules, moduleId];
    }
    localStorage.setItem("starred-modules", JSON.stringify(starredModules));
  }

  function showInstallInstructions() {
    triggerHapticFeedback();
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

<div class="flex-1 flex flex-col overflow-x-hidden">
  <!-- Pull-to-refresh indicator -->
  {#if isRefreshing}
    <div
      class="fixed top-0 left-0 right-0 bg-primary text-primary-foreground/50 py-2 text-center z-50 flex items-center justify-center gap-2"
    >
      <Loader class="w-4 h-4 animate-spin" />
      <span>Refreshing</span>
    </div>
  {/if}

  <div class="flex flex-col items-center pt-8 pb-8 text-center md:py-12">
    <h1 class="font-bold tracking-tight text-5xl">NIBM Toolkit</h1>
    <div
      class="mt-6 items-center justify-center flex flex-wrap justify-center gap-2"
    >
      <Button
        href="https://www.buymeacoffee.com/gaveshsaparamadu"
        size="lg"
        class="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12"
        >🍻 Support the Project</Button
      >
      {#if getDeviceType() == "android" || getDeviceType() == "iphone"}
        <Button
          size="icon"
          class="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 w-12 flex items-center justify-center"
          onclick={showInstallInstructions}
        >
          <Download class="w-4 h-4" />
        </Button>
      {/if}
    </div>
    <p class="mt-4 text-xs text-muted-foreground">
      Developed with ❤️ by Gavesh
    </p>
  </div>

  

  {#if userSettings.batch}
    <div
      class="mb-4 px-2 sm:px-8 w-full flex items-center justify-center overflow-x-hidden"
    >
      <div class="relative w-full max-w-xl mx-auto overflow-hidden" class:glowing-border={nextLecture != undefined}>
        <Alert.Root
          variant="default"
          class="w-full rounded-xl min-h-[96px] flex items-center"
        >
        {#if isCheckingLecture}
          <div class="flex items-center justify-center gap-2 w-full py-3">
            <Loader class="w-4 h-4 animate-spin" />
            <span class="text-xs text-muted-foreground font-medium uppercase tracking-wide">Finding your next lecture...</span>
          </div>
        {:else if nextLecture != undefined}
          <div class="w-full py-2 px-2">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Next {#if nextLecture.properties.is_exam}Exam{:else}Lecture{/if}
              </span>
              <Alert.Title class="text-sm sm:text-base font-semibold text-foreground break-words">
                {nextLecture.title}
              </Alert.Title>
              <Alert.Description>
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-muted-foreground space-y-1 sm:space-y-0">
                  {#if nextLecture.properties.is_exam}
                    <span class="flex-shrink-0">
                      <span class="font-medium text-red-600">EXAM</span>
                    </span>
                  {:else}
                    <span class="flex-shrink-0 break-words flex items-center gap-1">
                      by
                      <span class="font-medium text-foreground flex items-center gap-1">{nextLecture.lecturer}</span>
                      <span class="flex-shrink-0 flex gap-1 items-center">- <Clock class="w-4 h-4" />({nextLecture.time.start} - {nextLecture.time.end})</span>
                    </span>
                  {/if}
                  <span class="hidden sm:inline flex-shrink-0">&bull;</span>
                  <span class="flex-shrink-0 break-words flex items-center gap-1">
                    <MapPin class="w-4 h-4" />
                    {nextLecture.location.hall} - {nextLecture.location.floor}
                  </span>
                </div>
              </Alert.Description>
            </div>
          </div>
        {:else}
          <div class="flex items-center justify-center w-full py-3">
            <span class="text-xs text-muted-foreground">You're all caught up — no upcoming lectures.</span>
          </div>
        {/if}
        </Alert.Root>
      </div>
    </div>
  {/if}

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
            class="flex flex-wrap sm:flex-row gap-3 sm:justify-between items-center"
          >
            {#if module.hidden}
              <Button disabled class="w-fit sm:w-auto">
                <ExternalLink class="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            {:else}
              <Button href={module.linkUrl} class="w-fit  sm:w-auto">
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
        <Github class="h-6 w-6" />
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
      <a
        href="/v1/settings"
        rel="noopener noreferrer"
        class="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Set your personal details"
      >
        <Settings class="h-6 w-6" />
      </a>
    </div>
  </footer>

  <!-- Mobile Floating Action Button -->
  <div class="fixed bottom-20 right-4 sm:hidden z-40">
    <Button
      size="icon"
      class="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      onclick={() => {
        triggerHapticFeedback();
        showInstallInstructions();
      }}
      aria-label="Quick actions"
    >
      <Download class="w-6 h-6" />
    </Button>
  </div>
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
  @property --glow-deg {
    syntax: "<angle>";
    inherits: true;
    initial-value: -90deg;
  }

  @property --clr-1 {
    syntax: "<color>";
    inherits: true;
    initial-value: #8b5cf675;
  }

  @property --clr-2 {
    syntax: "<color>";
    inherits: true;
    initial-value: #3b82f675;
  }

  @property --clr-3 {
    syntax: "<color>";
    inherits: true;
    initial-value: #ec489975;
  }

  @property --clr-4 {
    syntax: "<color>";
    inherits: true;
    initial-value: #8b5cf675;
  }

  @property --clr-5 {
    syntax: "<color>";
    inherits: true;
    initial-value: #3b82f675;
  }

  .glowing-border {
    --gradient-glow: var(--clr-1), var(--clr-2), var(--clr-3), var(--clr-4),
      var(--clr-5), var(--clr-1);
    --border-width: 3px;
    --glow-size: 1rem;
    --glow-intensity: 0.125;
    border: var(--border-width, 3px) solid transparent;
    border-radius: 16px;
    background:
      linear-gradient(hsl(var(--background)) 0 0) padding-box,
      conic-gradient(from var(--glow-deg), var(--gradient-glow)) border-box;
    position: relative;
    isolation: isolate;
    animation: glow 10s infinite linear;
  }

  @keyframes glow {
    100% {
      --glow-deg: 270deg;
    }
  }

  .glowing-border::before,
  .glowing-border::after {
    content: "";
    position: absolute;
    border-radius: inherit;
  }

  .glowing-border::before {
    z-index: -1;
    background: hsl(var(--background));
    inset: 0.5rem;
    scale: 1 1;
    transform-origin: center;
    filter: blur(var(--glow-size, 1rem));
  }

  .glowing-border::after {
    z-index: -2;
    inset: -1.5rem;
    background: conic-gradient(from var(--glow-deg), var(--gradient-glow));
    filter: blur(var(--glow-size, 1rem));
    opacity: var(--glow-intensity, 0.125);
  }
</style>
