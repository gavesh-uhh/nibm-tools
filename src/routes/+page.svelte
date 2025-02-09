<script lang="ts">
  import { getDay, getRandomQuote } from "$lib/nibm";

  import LectureSlide from "./comps/LectureSlide.svelte";
  import { Search, X, Loader2 } from "lucide-svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { onMount } from "svelte";

  const toggleBranch = () => {
    const branches = ["SOC", "NIC", "SOB", "ALL"];
    const currentIndex = branches.indexOf(currentBranch);
    const nextIndex = (currentIndex + 1) % branches.length;
    currentBranch = branches[nextIndex];
  };

  let loaded: boolean = $state(false);
  let showFinishedLectures: boolean = $state(true);
  let searchBarInput: string = $state("");
  let currentBranch: string = $state("SOC");
  let currentOffset: number = $state(0);
  let currentDate: Date | undefined = $state(undefined);
  let lectures: Lecture[] = $state([]);

  const getBranchColorClass = (): string => {
    if (currentBranch === "SOC") return "soc";
    if (currentBranch === "SOB") return "sob";
    if (currentBranch === "NIC") return "nic";
    return "";
  };

  const isOver = (lecture: Lecture) => {
    if (lecture.time.end == undefined) return false;
    if (lecture.offset > 0) return false;
    if (showFinishedLectures) return false;
    const currentDT = new Date();
    const currentMinutes = currentDT.getHours() * 60 + currentDT.getMinutes();
    const lectureTimeStr = lecture.time.end.split(":");
    const lectureMinutes =
      parseInt(lectureTimeStr[0]) * 60 + parseInt(lectureTimeStr[1]);
    return currentMinutes > lectureMinutes;
  };

  const validateSearchQuery = (lecture: Lecture) => {
    if (searchBarInput === "") return true;
    if (!lecture) return false;
    if (lecture.title?.toLowerCase().startsWith(searchBarInput.toLowerCase()))
      return true;
    if (
      lecture.lecturer?.toLowerCase().startsWith(searchBarInput.toLowerCase())
    )
      return true;
    if (
      lecture.location.floor
        ?.toLowerCase()
        .startsWith(searchBarInput.toLowerCase())
    )
      return true;
    if (
      lecture.location.hall
        ?.toLowerCase()
        .startsWith(searchBarInput.toLowerCase())
    )
      if (lecture.properties.branch === currentBranch) return true;
    if (lecture.batch?.toLowerCase().startsWith(searchBarInput.toLowerCase()))
      return true;
  };

  onMount(async () => {
    loaded = false;
    currentDate = new Date();
    const dayString =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate();
    const response = await fetch("/api/lectures?date=" + dayString);
    const data = await response.json();
    data.forEach((item: Lecture) => {
      lectures = [...lectures, item];
    });
    setTimeout(() => {
      loaded = true;
    }, 1000);
  });
</script>

<div
  class="fixed bottom-10 p-4 z-20 left-0 w-full flex items-center justify-center"
>
  <div
    class=" flex flex-row items-center justify-center gap-2 w-fit p-2 bg-black/80 rounded-3xl"
  >
    <button
      class="offset"
      aria-current={currentOffset == 0 ? "true" : null}
      onclick={() => {
        currentOffset = 0;
      }}>Today</button
    >
    <button
      class="offset"
      aria-current={currentOffset == 1 ? "true" : null}
      onclick={() => {
        currentOffset = 1;
      }}>Tomorrow</button
    >

    <button
      class="offset"
      aria-current={currentOffset == 2 ? "true" : null}
      onclick={() => {
        currentOffset = 2;
      }}>Next {getDay(currentDate, 2)}</button
    >
  </div>
</div>

<div class="flex flex-col flex-1 h-full">
  <div class="px-8 py-8 flex flex-col items-center my-2">
    <h1
      class="text-muted-foreground text-2xl sm:text-3xl flex items-center flex-row gap-2 mb-1"
    >
      <Search class="w-6 h-6" />
      Search
    </h1>
    <div class="flex flex-row w-full gap-2 mt-2">
      <Input
        class="text-sm w-full"
        bind:value={searchBarInput}
        placeholder="DSE242.2F, Harison Hall, etc."
      ></Input>
      <Button
        size="icon"
        variant="destructive"
        on:click={() => (searchBarInput = "")}
      >
        <X class="w-3 h-3" />
      </Button>
    </div>
    <div class="w-full mt-2 flex flex-row gap-2">
      <button
        class={"branch-select " + getBranchColorClass()}
        onclick={toggleBranch}
      >
        Branch - {currentBranch}
      </button>
      <button
        class="tag"
        onclick={() => {
          searchBarInput = "DSE24.2F";
        }}
        aria-current={searchBarInput === "DSE24.2F" ? "true" : null}
        >DSE24.2F</button
      >
      <button
        class="tag"
        onclick={() => {
          showFinishedLectures = !showFinishedLectures;
        }}
        aria-current={showFinishedLectures ? "true" : null}
      >
        Show Finished
      </button>
    </div>
  </div>

  {#if loaded}
    {#if lectures.filter((item) => (item.properties.branch === currentBranch || currentBranch === "ALL") && validateSearchQuery(item) && item.offset == currentOffset).length === 0}
      <div class="h-full flex-1 flex flex-col gap-2 items-center">
        <h2 class="text-sm text-muted-foreground mt-10">
          Nothing found for {searchBarInput}
        </h2>
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        {#each lectures as item}
          {#if item.properties.branch === currentBranch || currentBranch === "ALL"}
            {#if !isOver(item) && validateSearchQuery(item) && item.offset == currentOffset}
              <LectureSlide lecture={item} />
            {/if}
          {/if}
        {/each}
      </div>
    {/if}
  {:else}
    <div class="h-full flex-1 flex flex-col gap-2 items-center">
      <div class="mt-10 flex items-center flex-col gap-2">
        <Loader2 class="w-5 h-5 animate-spin opacity-60" />
        <h1
          class="text-xs mt-3 max-w-[250px] text-center text-muted-foreground"
        >
          {getRandomQuote()}
        </h1>
      </div>
    </div>
  {/if}
</div>

<style>
  @property --lecture-grad {
    syntax: "<color>";
    initial-value: #2e2e2e9f;
    inherits: false;
  }

  .offset {
    @apply px-4 py-2 rounded-3xl text-xs sm:text-base;
    @apply bg-muted;
    transition: all 150ms ease-out;
  }

  .offset[aria-current="true"] {
    @apply bg-blue-900;
  }

  .branch-select {
    background: linear-gradient(135deg, var(--lecture-grad), #121212);
    color: #f9f9f9;
    border: 1px solid #333;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    @apply px-5 py-2 rounded-xl text-xs sm:text-base;
    transition: --lecture-grad 350ms ease-out;
  }

  .branch-select.sob {
    --lecture-grad: #00ff509f;
  }

  .branch-select.nic {
    --lecture-grad: #ffff009f;
  }

  .branch-select.soc {
    --lecture-grad: #0e98ba9f;
  }

  .tag {
    @apply px-4 py-2 rounded-3xl text-xs sm:text-base;
    @apply bg-muted;
    transition: all 150ms ease-out;
  }

  .tag[aria-current="true"] {
    @apply bg-blue-300 text-black;
  }
</style>
