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
  class="ring-1 flex flex-col items-center relative p-4 rounded-lg ring-muted bg-muted/25"
>
  <div class="flex flex-row items-center w-full gap-2">
    <div class="flex flex-col gap-1 flex-1">
      <div>
        <h1 class="text-xs text-muted-foreground">{exam.batch}</h1>
      </div>
      <div>
        <h1 class="text-1xl">{exam.title}</h1>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">{exam.date} @ {exam.time}</p>
      </div>
      {#if daysLeft <= 7}
        <div>
          <p class="text-xs text-red-400/50">
            NOTICE: {remainingDayString} remaining
          </p>
        </div>
      {/if}
    </div>
    <div>
      <Button class="flex items-center" href={exam.url}>
        <Pointer class="w-4 h-4 mr-2" />
        Apply</Button
      >
    </div>
  </div>
  {#if exam.is_special}
    <div class="w-full">
      <hr class="my-3" />
      <h1 class="text-xs text-yellow-300 flex flex-row items-center">
        ⚠️ Special Exam
      </h1>
    </div>
  {/if}
</div>
