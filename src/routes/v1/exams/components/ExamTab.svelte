<script lang="ts">
  import { Pointer } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  const { exam }: { exam: Exam } = $props();

  const getRemainingTime = () => {
    if (!exam.date || !exam.time) return "Unknown";
    const currentDate = new Date();
    const [year, month, day] = exam.date.split("-").map(Number);
    const [hours, minutes] = exam.time
      .replaceAll("pm", "")
      .replaceAll("am", "")
      .trim()
      .split(":")
      .map(Number);
    const examDate = new Date(year, month - 1, day, hours, minutes);

    const diffMs = examDate.getTime() - currentDate.getTime();
    if (diffMs <= 0) return "Expired";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  };

  const getDifferenceBetweenDates = () => {
    if (!exam.date) return 0;
    const currentDate = new Date();
    const [year, month, day] = exam.date.split("-").map(Number);
    const examDate = new Date(year, month - 1, day);
    return Math.floor(
      (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const daysLeft = $state(getDifferenceBetweenDates());
  const remainingDayString = $state(getRemainingTime());
</script>

<div
  class="flex flex-col space-y-3 rounded-lg border bg-card p-4 text-card-foreground transition-all hover:shadow-md"
>
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <p class="text-sm text-muted-foreground">{exam.batch}</p>
      <h2 class="text-lg font-semibold leading-tight">{exam.title}</h2>
    </div>
    {#if exam.is_special}
      <div class="ml-4 flex-shrink-0">
        <span
          class="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20"
        >
          Special Exam
        </span>
      </div>
    {/if}
  </div>

  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <span>{exam.date} @ {exam.time}</span>
    {#if daysLeft >= 0 && daysLeft <= 7}
      <span
        class="font-semibold"
        class:text-red-500={daysLeft <= 2}
        class:text-yellow-500={daysLeft > 2}
      >
        {remainingDayString} left
      </span>
    {:else if daysLeft < 0}
      <span class="font-semibold text-red-600">Expired</span>
    {/if}
  </div>

  <div class="flex items-center justify-end pt-2">
    <Button href={exam.url} size="sm" variant={daysLeft < 0 ? 'secondary' : 'default'}>
      <Pointer class="mr-2 h-4 w-4" />
      {#if daysLeft < 0}
        View Details
      {:else}
        Apply Now
      {/if}
    </Button>
  </div>
</div>
