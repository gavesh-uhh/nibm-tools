<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    ArrowLeft,
    Home,
    BookOpen,
    FileText,
    Settings,
    Calendar,
  } from "lucide-svelte";
  import { page } from "$app/stores";
  let { children } = $props();
</script>

<div class="flex flex-col flex-1 pb-20 sm:pb-0">
  <div class="">
    <div class="flex gap-3 w-fit items-center">
      <Button href="/" variant="outline" size="icon" class="rounded-full">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <span class="hidden sm:block">Back</span>
    </div>
  </div>
  <div class="mt-2 flex-1">
    {@render children()}
  </div>
</div>

<!-- Mobile Bottom Navigation -->
<div
  class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 sm:hidden z-50"
>
  <div class="flex justify-around items-center py-3 px-2">
    <Button 
      href="/" 
      variant={$page.url.pathname === "/" ? "default" : "ghost"} 
      size="sm" 
      class="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <Home class="w-5 h-5" />
      <span class="text-xs font-medium">Home</span>
    </Button>
    
    <Button 
      href="/v1/lectures" 
      variant={$page.url.pathname.startsWith("/v1/lectures")
        ? "default"
        : "ghost"}
      size="sm" 
      class="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <BookOpen class="w-5 h-5" />
      <span class="text-xs font-medium">Lectures</span>
    </Button>
    
    <Button 
      href="/v1/exams" 
      variant={$page.url.pathname.startsWith("/v1/exams")
        ? "default"
        : "ghost"}
      size="sm" 
      class="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <Calendar class="w-5 h-5" />
      <span class="text-xs font-medium">Exams</span>
    </Button>
    
    <Button 
      href="/v1/papers" 
      variant={$page.url.pathname.startsWith("/v1/papers")
        ? "default"
        : "ghost"}
      size="sm" 
      class="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <FileText class="w-5 h-5" />
      <span class="text-xs font-medium">Papers</span>
    </Button>
    
    <Button 
      href="/v1/settings" 
      variant={$page.url.pathname.startsWith("/v1/settings")
        ? "default"
        : "ghost"}
      size="sm" 
      class="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <Settings class="w-5 h-5" />
      <span class="text-xs font-medium">Settings</span>
    </Button>
  </div>
</div>
