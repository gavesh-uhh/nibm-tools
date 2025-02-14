<script lang="ts">
  import { Pointer, Link } from "lucide-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
</script>

<div class="flex-1 flex flex-col">
  <div class="flex flex-col items-center mt-10">
    <h1 class="text-accent-foreground text-4xl font-semibold">NIBM Tools</h1>
    <p class="text-muted-foreground text-xs">
      "This might be illegal" | made by Gavesh ❤️
    </p>
    <a
      href="https://www.gavesh.live"
      class="underline underline-offset-2 flex flex-col items-center gap-1 mt-2"
    >
      <Link class="w-4 h-4" />
      Visit My Website</a
    >
  </div>
  <div
    class="flex flex-col sm:flex-row flex-wrap gap-2 justify-center items-center mt-10"
  >
    <div class="max-w-[500px] rounded-lg ring-1 ring-border p-6">
      <h1 class="text-2xl font-semibold">Lecture Explorer</h1>
      <p class="text-muted-foreground">
        Scroll through lectures up to three days without breaking your neck in
        the morning
      </p>
      <hr class="my-4" />
      <Button href="/v1/lectures">
        <Pointer class="w-4 h-4 mr-2" />
        Check Out Lectures</Button
      >
    </div>
    <div class="max-w-[500px] rounded-lg ring-1 ring-border p-6">
      <h1 class="text-2xl font-semibold">Past Paper Downloader</h1>
      <p class="text-muted-foreground">
        Find and download past papers at lightning speed... and in bulk. You’re
        welcome.
      </p>
      <hr class="my-4" />
      <Button href="/v1/papers">
        <Pointer class="w-4 h-4 mr-2" />
        Grab Papers</Button
      >
    </div>
    <div class="max-w-[500px] rounded-lg ring-1 ring-border p-6">
      <h1 class="text-2xl font-semibold">Exam Viewer</h1>
      <p class="text-muted-foreground">
        It’s like the official exam viewer, but actually bearable to look at.
        And with extra stuff.
      </p>
      <hr class="my-4" />
      <Button href="/v1/exams">
        <Pointer class="w-4 h-4 mr-2" />
        View Exams</Button
      >
    </div>
  </div>
</div>
