<script lang="ts">
  import Progress from "$lib/components/ui/progress/progress.svelte";
  import { onMount } from "svelte";

  const { lecture }: { lecture: Lecture } = $props();
  const trimToLength = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
  };

  let currentDateTime: Date | undefined;
  let is_going_on: boolean = $state(false);
  let progress: number = $state(0);
  let nearest_exam: Exam | null = $state(null);

  const findNearestExam = async () => {
    const response = await fetch("/api/exams?examName=" + lecture.title);
    const data = await response.json();
    const exams: Exam[] = data;
    exams.forEach((x) => {
      if (x.batch != lecture.batch) return;
      nearest_exam = x;
    });
  };

  onMount(async () => {
    findNearestExam();
    updateTime();
    setInterval(() => {
      updateTime();
    }, 1000);
  });

  const updateTime = () => {
    currentDateTime = new Date();
    is_going_on = checkIfLive();
    progress = calculateProgress();
  };

  const checkIfLive = () => {
    if (
      !currentDateTime ||
      !lecture.time ||
      !lecture.time.start ||
      !lecture.time.end
    )
      return false;

    const currentMinutes =
      currentDateTime.getHours() * 60 + currentDateTime.getMinutes();
    const startMinutes = parseTime(lecture.time.start);
    const endMinutes = parseTime(lecture.time.end);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const calculateProgress = () => {
    if (
      !currentDateTime ||
      !lecture.time ||
      !lecture.time.start ||
      !lecture.time.end
    )
      return 0;

    const startMinutes = parseTime(lecture.time.start);
    const endMinutes = parseTime(lecture.time.end);
    const currentMinutes =
      currentDateTime.getHours() * 60 + currentDateTime.getMinutes();

    if (currentMinutes < startMinutes) return 0;
    if (currentMinutes > endMinutes) return 100;

    return Math.round(
      ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100,
    );
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const trimLengths = {
    default: 45,
    sm: 25,
    md: 20,
  };
</script>

<div class="ring-1 relative p-4 rounded-lg ring-muted bg-muted/25">
  {#if lecture.properties.is_exam}
    <div class="red-gradient"></div>
  {/if}
  <div class="flex items-center w-full justify-between z-20">
    <h1 class="text-muted-foreground text-xs opacity-85 text-left flex gap-1">
      {#if lecture.properties.branch === "SOC"}
        <span class="text-blue-500">SOC | </span>
      {:else if lecture.properties.branch == "NIC"}
        <span class="text-yellow-500">NIC | </span>
      {:else}
        <span class="text-green-500">SOB | </span>
      {/if}

      {#if lecture.batch}
        <div class="flex flex-row gap-1">
          {#each lecture.batch as item}
            <p>{trimToLength((item + "") as string, 15)}</p>
          {/each}
        </div>
      {/if}
    </h1>
  </div>
  <div class="flex items-center w-full justify-between">
    <h1 class="text-sm sm:text-base md:text-lg font-medium">
      <span class="inline sm:hidden">
        {trimToLength(lecture.title as string, trimLengths.md)}
      </span>
      <span class="hidden sm:inline md:hidden">
        {trimToLength(lecture.title as string, trimLengths.sm)}
      </span>
      <span class="hidden md:inline">
        {trimToLength(lecture.title as string, trimLengths.default)}
      </span>
    </h1>
    {#if !lecture.properties.is_exam}
      <h1 class="text-xs text-right opacity-50">{lecture.lecturer}</h1>
    {:else if lecture.properties.is_exam}
      <h1 class="text-xs text-right text-yellow-300">EXAM</h1>
    {/if}
  </div>
  <div class="flex mt-3 items-center w-full justify-between">
    <h1 class="text-sm text-muted-foreground">
      {lecture.location.hall} on {lecture.location.floor}
    </h1>
    <h1 class="text-right text-sm text-muted-foreground">
      {lecture.time.start} - {lecture.time.end}
    </h1>
  </div>
  {#if nearest_exam}
    <hr class="mt-2" />
    <div class="flex mt-3 items-center w-full justify-between">
      <h1 class="text-xs text-muted-foreground text-right">
        Upcoming Exam @ {nearest_exam.date}
      </h1>
    </div>
  {/if}
  {#if is_going_on && lecture.offset == 0}
    <hr class="mt-2" />
    <div class="flex mt-3 items-center w-full justify-between">
      <div class="opacity-80 w-full items-center flex flex-row gap-2">
        <Progress value={progress} max={100} class="flex-1" />
        <h1 class="text-xs text-muted-foreground text-right">
          {#if progress <= 10}
            Just Started
          {:else}
            {progress}%
          {/if}
        </h1>
      </div>
    </div>
  {/if}
</div>

<style>
  .red-gradient {
    @apply rounded-lg;
    opacity: 25%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(162, 29, 29);
    background: linear-gradient(
      0deg,
      rgba(162, 29, 29, 0.75) 5%,
      rgba(0, 0, 0, 0) 80%
    );
  }
</style>
