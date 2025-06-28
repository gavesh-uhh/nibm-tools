<script lang="ts">
  import { getDay, getRandomQuote } from "$lib/nibm";

  import LectureSlide from "./components/LectureSlide.svelte";
  import { Search, X, Loader2, Calendar, Clock, MapPin, User, Filter, ArrowRight } from "lucide-svelte";
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
  let showFilters: boolean = $state(false);
  let filterTime: string = $state("");
  let filterLocation: string = $state("");
  let filterLecturer: string = $state("");
  let lecturers: string[] = $state([]);
  let floors: string[] = $state([]);

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

  const loadLectures = async () => {
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
    lectures = data;
    
    // Extract unique lecturers and floors
    lecturers = [...new Set(data.map((l: Lecture) => l.lecturer).filter(Boolean))].sort() as string[];
    floors = [...new Set(data.map((l: Lecture) => l.location?.hall).filter(Boolean))].sort() as string[];
    
    loaded = true;
  };

  onMount(async () => {
    await loadLectures();
  });

  const validateSearchQuery = (lecture: Lecture) => {
    if (!lecture) return false;
    if (searchBarInput === "" && !filterTime && !filterLocation && !filterLecturer) return true;

    const input = searchBarInput.toLowerCase();
    const timeMatch = !filterTime || (lecture.time?.start && lecture.time.start.startsWith(filterTime));
    const locationMatch = !filterLocation || (lecture.location?.hall && lecture.location.hall.toLowerCase().includes(filterLocation.toLowerCase()));
    const lecturerMatch = !filterLecturer || lecture.lecturer?.toLowerCase().includes(filterLecturer.toLowerCase());

    const basicMatch = 
      lecture.title?.toLowerCase().startsWith(input) ||
      lecture.lecturer?.toLowerCase().startsWith(input) ||
      lecture.location.floor?.toLowerCase().startsWith(input) ||
      (lecture.location.hall?.toLowerCase().startsWith(input) && lecture.properties.branch === currentBranch) ||
      lecture.batch?.some((batch) => batch.toLowerCase().startsWith(input));

    return basicMatch && timeMatch && locationMatch && lecturerMatch;
  };

  function jumpToCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const currentLecture = lectures.find(lecture => {
      if (lecture.offset !== 0) return false;
      if (!lecture.time?.start || !lecture.time?.end) return false;
      const [startHour, startMinute] = lecture.time.start.split(':').map(Number);
      const [endHour, endMinute] = lecture.time.end.split(':').map(Number);
      
      const lectureStart = startHour * 60 + startMinute;
      const lectureEnd = endHour * 60 + endMinute;
      const currentTime = currentHour * 60 + currentMinute;
      
      return currentTime >= lectureStart && currentTime <= lectureEnd;
    });

    if (currentLecture) {
      const element = document.getElementById(`lecture-${currentLecture.title}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch(event.key) {
        case 'f':
          event.preventDefault();
          document.querySelector('input')?.focus();
          break;
        case 'j':
          event.preventDefault();
          jumpToCurrentTime();
          break;
        case '[':
          event.preventDefault();
          if (currentOffset > 0) currentOffset--;
          break;
        case ']':
          event.preventDefault();
          if (currentOffset < 2) currentOffset++;
          break;
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div
  class="fixed bottom-10 p-4 z-20 left-0 w-full flex items-center justify-center"
>
  <div
    class="flex flex-row items-center justify-center gap-1 sm:gap-2 w-fit p-2 bg-black/80 rounded-3xl"
  >
    <button
      class="offset"
      aria-current={currentOffset == 0 ? "true" : null}
      onclick={() => currentOffset = 0}
    >
      Today
    </button>
    <button
      class="offset"
      aria-current={currentOffset == 1 ? "true" : null}
      onclick={() => currentOffset = 1}
    >
      Tomorrow
    </button>
    <button
      class="offset"
      aria-current={currentOffset == 2 ? "true" : null}
      onclick={() => currentOffset = 2}
    >
      Next {getDay(currentDate, 2)}
    </button>
  </div>
</div>

<div class="flex flex-col flex-1 h-full">
  <div class="flex flex-col items-center w-full">
    <div class="flex flex-col items-center my-2 sm:max-w-[600px] mb-10 w-full">
      <h1
        class="text-muted-foreground text-2xl sm:text-3xl flex items-center flex-row gap-2 mb-1"
      >
        <Search class="w-7 h-7" />
        Lecture Search
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
          onclick={() => {
            searchBarInput = "";
            filterTime = "";
            filterLocation = "";
            filterLecturer = "";
          }}
        >
          <X class="w-3 h-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onclick={() => showFilters = !showFilters}
        >
          <Filter class="w-3 h-3" />
        </Button>
      </div>
      {#if showFilters}
        <div class="w-full mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4" />
            <Input
              class="text-sm"
              bind:value={filterTime}
              placeholder="Filter by time"
            />
          </div>
          <div class="flex items-center gap-2">
            <User class="w-4 h-4" />
            <select
              class="select"
              bind:value={filterLecturer}
            >
              <option value="">All Lecturers</option>
              {#each lecturers as lecturer}
                <option value={lecturer}>{lecturer}</option>
              {/each}
            </select>
          </div>
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4" />
            <select
              class="select"
              bind:value={filterLocation}
            >
              <option value="">All Floors</option>
              {#each floors as floor}
                <option value={floor}>{floor}</option>
              {/each}
            </select>
          </div>
        </div>
      {/if}
      <div class="w-full mt-2 flex flex-row gap-1 flex-wrap">
        <button
          class={"branch-select w-full " + getBranchColorClass()}
          onclick={toggleBranch}
        >
          {#if currentBranch === "ALL"}
            Showing Every Branch
          {:else}
            Selected Branch - {currentBranch}
          {/if}
        </button>
      </div>
      <div class="w-full mt-2 flex flex-row gap-1 flex-wrap">
        <button
          class="tag"
          onclick={() => {
            searchBarInput = "DSE24.2F";
          }}
          aria-current={searchBarInput === "DSE24.2F" ? "true" : null}
        >
          DSE24.2F
        </button>
        <button
          class="tag"
          onclick={() => {
            showFinishedLectures = !showFinishedLectures;
          }}
          aria-current={showFinishedLectures ? "true" : null}
        >
          Show Finished
        </button>
        <button
          class="tag"
          onclick={jumpToCurrentTime}
        >
          Jump to Current
        </button>
      </div>
    </div>
  </div>
  {#if loaded}
    {#if lectures.filter((item) => (item.properties.branch === currentBranch || currentBranch === "ALL") && validateSearchQuery(item) && item.offset == currentOffset).length === 0}
      <div class="h-full flex-1 flex flex-col gap-2 items-center">
        <h2 class="text-sm text-muted-foreground mt-10">
          {#if searchBarInput !== "" || filterTime || filterLocation || filterLecturer}
            Nothing found for your search criteria
          {:else}
            No lectures found on the server for {getDay(currentDate, currentOffset)}
          {/if}
        </h2>
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        {#each lectures as item, i (item.title + '-' + item.time?.start + '-' + item.location?.hall + '-' + item.offset + '-' + item.batch?.join('-') + '-' + i)}
          {#if item.properties.branch === currentBranch || currentBranch === "ALL"}
            {#if !isOver(item) && validateSearchQuery(item) && item.offset == currentOffset}
              <div id="lecture-{item.title}">
                <LectureSlide lecture={item} />
              </div>
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
    @apply px-2 sm:px-4 py-1.5 sm:py-2 rounded-3xl text-xs sm:text-sm;
    @apply bg-muted hover:bg-muted/80;
    transition: all 150ms ease-out;
    white-space: nowrap;
  }

  .offset[aria-current="true"] {
    @apply bg-blue-900;
  }

  .offset:disabled {
    @apply opacity-50 cursor-not-allowed;
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
    @apply px-3 py-1 rounded-full text-xs;
    @apply bg-muted hover:bg-muted/80;
    transition: all 150ms ease-out;
  }

  .tag[aria-current="true"] {
    @apply bg-blue-900;
  }

  .tag:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .select {
    @apply w-full text-sm bg-muted border border-border rounded-md px-3 py-1.5;
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
    @apply hover:bg-muted/80 transition-colors;
  }

  .select option {
    @apply bg-background text-foreground;
  }
</style>
