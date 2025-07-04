<script lang="ts">
  import {
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

  let nextLecture: Lecture | undefined = $state(undefined);
  let starredModules: string[] = $state([]);
  let showInstallGuide = $state(false);
  let isCheckingLecture = $state(false);
  let userSettings: { batch?: string; fullBatch?: string } = $state({});
  let showNoLectures = $state(false);

  onMount(async () => {
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

    const getPendingLectures = async () => {
      try {
        if (localStorage.getItem("user-settings") == null) return;
        isCheckingLecture = true;
        userSettings = JSON.parse(
          localStorage.getItem("user-settings") ?? "{}",
        );
        const userBatch = userSettings.batch;
        const userBranch = userSettings.fullBatch;
        const currentDate = new Date();
        const dayString =
          currentDate.getFullYear() +
          "-" +
          (currentDate.getMonth() + 1) +
          "-" +
          currentDate.getDate();

        const response = await fetch(
          `/api/lectures?date=${dayString}&batch=${userBatch}&limit=3`,
        );
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

    await getPendingLectures();
    setTimeout(preloadLectures, 1000);
  });

  const convertLecToUnitMinutes = async (timeString: string) => {
    const splittedString = timeString.split(":");
    const hours = parseInt(splittedString[0]) * 60;
    const mins = parseInt(splittedString[1]);
    return hours + mins;
  };

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

<div class="flex-1 flex flex-col">
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

  {#if userSettings.batch && isCheckingLecture}
    <div class="w-full px-2 mb-4 sm:px-8">
      <div class="relative w-full max-w-xl mx-auto">
        <Alert.Root variant="default" class="w-full rounded-xl ">
          <div class="flex flex-col gap-1 items-center justify-center py-4">

            <span
              class="text-xs text-muted-foreground flex flex-row gap-2 items-center font-medium uppercase tracking-wide mb-1"
              >
            <Loader class="w-4 h-4 animation-spin" />
             Checking for your next lecture...</span
            >
          </div>
        </Alert.Root>
      </div>
    </div>
  {/if}

  <div class="w-full px-2 mb-4 sm:px-8 flex items-center justify-center">
    {#if showNoLectures}
      <div
        class="relative w-full max-w-xl mx-auto"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 600 }}
      >
        <Alert.Root variant="destructive" class="w-full rounded-xl min-h-[120px] flex items-center">
          <div class="flex flex-col gap-1 items-center justify-center py-4 w-full">
            <span class="text-lg font-bold text-destructive"
              >NO LECTURES FOUND :(</span
            >
          </div>
        </Alert.Root>
      </div>
    {:else if nextLecture != undefined}
      <div class="relative w-full max-w-xl mx-auto">
        <div
          class="absolute inset-0 -z-10 rounded-xl pointer-events-none opacity-25"
        >
          {#if nextLecture.properties.is_exam}
            <div
              class="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-red-300 via-yellow-400 to-orange-500 blur-[90px] rounded-full opacity-50 animate-[gemini-spin1_8s_linear_infinite]"
            ></div>
            <div
              class="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-tr from-amber-400 via-red-400 to-pink-500 blur-[90px] rounded-full opacity-50 animate-[gemini-spin2_10s_linear_infinite]"
            ></div>
            <div
              class="absolute inset-0 rounded-xl bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 opacity-80"
            ></div>
          {:else}
            <!-- Regular lecture gradients -->
            <div
              class="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-indigo-500 blur-[90px] rounded-full opacity-60 animate-[gemini-spin1_8s_linear_infinite]"
            ></div>
            <div
              class="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-tr from-pink-400 via-blue-400 to-purple-500 blur-[90px] rounded-full opacity-60 animate-[gemini-spin2_10s_linear_infinite]"
            ></div>
            <div
              class="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-90"
            ></div>
          {/if}
        </div>
        <Alert.Root variant="default" class="w-full rounded-xl min-h-[120px] relative">
          <div class="flex flex-col gap-1 py-2">
            <span
              class="text-xs text-muted-foreground font-medium uppercase tracking-wide"
              >Next
              {#if nextLecture.properties.is_exam}
                Exam
              {:else}
                Lecture
              {/if}
            </span>
            <Alert.Title
              class="text-base sm:text-lg font-semibold text-foreground"
              >{nextLecture.title}</Alert.Title
            >
            <Alert.Description>
              <div
                class="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground"
              >
                {#if nextLecture.properties.is_exam}
                  <span><span class="font-medium text-red-600">EXAM</span></span>
                {:else}
                  <span
                    >by <span class="font-medium text-foreground"
                      >{nextLecture.lecturer}</span
                    ></span
                  >
                {/if}
                <span class="hidden sm:inline">&bull;</span>
                <span>{nextLecture.time.start} - {nextLecture.time.end}</span>
                <span class="hidden sm:inline">&bull;</span>
                <span
                  >{nextLecture.location.hall} - {nextLecture.location
                    .floor}</span
                >
              </div>
            </Alert.Description>
          </div>
        </Alert.Root>
      </div>
    {/if}
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
